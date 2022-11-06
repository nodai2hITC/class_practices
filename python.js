/** 
 * @file OnBrowserJudge - for Python
 * @author nodai2hITC
 * @license MIT License
 * @version v1.0.0
 */

"use strict";

{
  const pythonInitialize = async function() {
    OnBrowserJudge.pyodideReadyPromise = await loadPyodide();

    if ("pythonPackages" in OnBrowserJudge) {
      await OnBrowserJudge.pyodideReadyPromise.loadPackage(OnBrowserJudge.pythonPackages);
    }
    OnBrowserJudge.enableRunButton();
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js";
  script.onload = pythonInitialize;
  const s0 = document.getElementsByTagName("script")[0];
  s0.parentNode.insertBefore(script, s0);
};

OnBrowserJudge.runProgram = async function(program, input) {
  const pyodide = await OnBrowserJudge.pyodideReadyPromise;
  const globals = pyodide.toPy({});
  pyodide.runPython(`
import sys, io

_in = io.StringIO('''${this.escape(input)}''')
sys.stdin = _in
_out = io.StringIO()
sys.stdout = sys.stderr = _out
`, { globals: globals});
  pyodide.runPython(program, { globals: pyodide.toPy({}) });
  return pyodide.runPython("_out.getvalue()", { globals: globals });
};
