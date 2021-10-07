import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ModulesCollection, RunsCollection } from '../api/modules';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

const worker = new Worker('/py-runner.js');

function runPython(script, context, onSuccess, onError){
    worker.onerror = onError;
    worker.onmessage = (e) => onSuccess(e.data);
    worker.postMessage({
        ...context,
        python: script,
    });
}

export const getModules = (user) => {
    let modules = user.username == "instructor" ? ModulesCollection.find({}).fetch() : ModulesCollection.find({ user: user._id }).fetch();
    console.log(modules);
    if (modules.length < 1) {
      modules = ModulesCollection.insert({contents: "print(\"Hello, world!\")", createdAt: new Date(), user: user._id});
    }
    return useTracker(() => modules);
  }  

// Transform the run (callback) form to a more modern async form.
// This is what allows to write:
//    const {results, error} = await asyncRun(script, context);
// Instead of:
//    run(script, context, successCallback, errorCallback);
export function asyncRunPython(script, context) {
    return new Promise(function(onSuccess, onError) {
        runPython(script, context, onSuccess, onError);
    });
}

const compile = async (script, setOutput) => {
    try {
        const results = await asyncRunPython(script, {});
        let output = results.error ?results.error : results.stdout;
        setOutput(output);
      } catch(error) {
        console.warn(error)
      }
}

const onChange = (module, setOutput) => async (newVal, event) => {
  const script = newVal;
  ModulesCollection.update(module._id, {
    $set: {
      contents: script
    }
  });

  compile(script, setOutput);
}

export const ResultViewer = ({ module_id }) => {
  const run = useTracker(() => {
    return RunsCollection.findOne({ module: module_id }, {sort: {createdAt: -1}});
  });

  return <div className="output">
    {run && <div >{run.output}</div>}
  </div>;
}

export const Module = ({ module, title }) => {

  const [output, setOutput] = useState(null)

  useEffect(() => {
      compile(module.contents, setOutput);
  });

  useEffect(() => {
    RunsCollection.insert({
        module: module._id,
        input: "",
        output,
        createdAt: new Date()
    });
  }, [output]);


  return (
    <div>
        <h2>{title}</h2>
        <AceEditor
        mode="python"
        theme="github"
        setOptions={{
            useSoftTabs: true
        }}
        height="200px"
        width="350px"
        onChange={onChange(module, setOutput)}
        debounceChangePeriod={1000}
        name={module._id}
        editorProps={{ $blockScrolling: true }}
        value={module.contents}
        />
        {output ? <ResultViewer module_id={module._id} /> : null}
    </div>
  );
};
