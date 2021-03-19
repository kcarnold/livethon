import React from 'react';
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


const onChange = mod => async (newVal, event) => {
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

const cloneModule = mod => {
  const {filename, contents} = mod;
  ModulesCollection.insert({filename, contents, createdAt: new Date()});
}

const removeModule = mod => {
  ModulesCollection.remove({_id: mod._id});
}

export const ResultViewer = ({module_id}) => {
  const run = useTracker(() => {
    return RunsCollection.findOne({module: module_id}, {sort: {createdAt: -1}});
  });

  return <div className="output">
    {run && <div style={{whiteSpace: "pre", fontFamily: "monospace"}}>{run.output}</div>}
  </div>;
}

export const Info = () => {
  const modules = useTracker(() => {
    return ModulesCollection.find().fetch();
  });

  return (
    <div>
      <div className="allModules">{modules.map(
        (module, i) => <div key={module._id}>
          <h3>{module.filename}</h3>
          <button onClick={e => cloneModule(module)}>Clone</button>
          {modules.length > 1 ? <button onClick={e => removeModule(module)}>Remove</button> : null}
          <AceEditor
            mode="python"
            theme="github"
            setOptions={{
              useSoftTabs: true
            }}
            height="200px"
            width="350px"
            onChange={onChange(module)}
            debounceChangePeriod={1000}
            name={module._id}
            editorProps={{ $blockScrolling: true }}
            value={module.contents}
          />
        <ResultViewer module_id={module._id} />
      </div>
      )}</div>
    </div>
  );
};
