import React, { useState } from 'react';
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


const onChange = (mod, setOutput) => async (newVal, event) => {
  const script = newVal;
  ModulesCollection.update(mod._id, {
    $set: {
      contents: script
    }
  })
  try {
    const results = await asyncRunPython(script, {});
    let output = results.error ?results.error : results.stdout;
    console.log(results);
    setOutput(output)

    RunsCollection.insert({
      module: mod._id,
      input: "",
      output,
      createdAt: new Date()
    })
  } catch(error) {
    console.warn(error)
  }
}

export const createModule = () => {
  return ModulesCollection.insert({body: "print(\"Hello, world!\")", createdAt: new Date()});
}

export const ResultViewer = ({module_id}) => {
  const run = useTracker(() => {
    return RunsCollection.findOne({module: module_id}, {sort: {createdAt: -1}});
  });

  return <div className="output">
    {run && <div >{run.output}</div>}
  </div>;
}

export const Info = ({moduleID}) => {

  const modules = useTracker(() => {
    return ModulesCollection.find({_id: moduleID}).fetch();
  });

  console.log(moduleID)
  const [output, setOutput] = useState(null)

  return (
    <div>
      <div className="allModules">{modules.map(
        (module, i) => <div key={module._id}>
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
            value={module.body}
          />
        {output ? <ResultViewer module_id={module._id} /> : null}
      </div>
      )}</div>
    </div>
  );
};
