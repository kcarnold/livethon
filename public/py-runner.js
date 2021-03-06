// https://pyodide.readthedocs.io/en/latest/usage/webworker.html

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.data`, `.json`,
// and `.wasm` files as well:
self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.16.1/full/pyodide.js');

let pythonLoading;
async function loadPythonPackages(){
    await languagePluginLoader;
    pythonLoading = self.pyodide.loadPackage(['numpy', 'pytz']);
}

self.onmessage = async(event) => {
    await languagePluginLoader;
     // since loading package is asynchronous, we need to make sure loading is done:
    await pythonLoading;
    // Don't bother yet with this line, suppose our API is built in such a way:
    const {python, ...context} = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)){
        self[key] = context[key];
    }

    await self.pyodide.runPythonAsync(`
import io, sys
sys.stdout = io.StringIO()
`)

    // Now is the easy part, the one that is similar to working in the main thread:
    try {
        let results = await self.pyodide.runPythonAsync(python);
        let stdout = await self.pyodide.runPythonAsync("sys.stdout.getvalue()")
        self.postMessage({
            results, stdout
        });
    }
    catch (error){
        self.postMessage(
            {error : error.message}
        );
    }
}