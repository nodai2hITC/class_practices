/** 
 * @file OnBrowserJudge - mainfile
 * @author nodai2hITC
 * @license MIT License
 * @version v1.0.0
 */

"use strict";

const OnBrowserJudge = {
  dict: {
    enabled_button: "▶Run",
    disabled_button: "Running",
    case_name: "Case Name",
    status: "Status",
    exec_time: "Exec Time",
    copy: "Copy",
    copied: "Copied.",
    AC: "AC",
    WA: "WA",
    RE: "RE",
    CE: "CE",
    IE: "IE",
    TLE: "TLE",
    MLE: "MLE",
    OLE: "OLE",
    WJ: "WJ"
  },

  congratulations: function() {},

  disableRunButton: function() {
    this.runButton.disabled = true;
    this.runButton.innerHTML = this.dict.disabled_button;
  },

  enableRunButton: function() {
    this.runButton.disabled = false;
    this.runButton.innerHTML = this.dict.enabled_button;
  },

  copyProgram: function() {
    navigator.clipboard.writeText(getProgram(true));
  },

  run: async function() {
    if (this.runButton.disabled) return;
    this.disableRunButton();
    const autocopy = document.getElementById("autocopy");
    if (!autocopy || autocopy.checked) this.copyProgram();
    this.initializeResult();

    setTimeout(async function() {
      let allPassed = true;
      const program = getProgram();
      for(const testName of OnBrowserJudge.tests) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const result = await OnBrowserJudge.test(testName, program);
        if (result != "AC") allPassed = false;
      }
      OnBrowserJudge.enableRunButton();
      if (allPassed) OnBrowserJudge.congratulations();
    }, 20);
  },

  initializeResult: function() {
    document.getElementById("result").innerHTML = `
<thead><tr>
    <th>${this.dict.case_name}</th>
    <th>${this.dict.status}</th>
    <th>${this.dict.exec_time}</th>
</tr></thead>`;

    for(const testName of OnBrowserJudge.tests) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
<td id="${testName}">${testName}</td>
<td id="${testName}_status">${this.dict.WJ}</td>
<td id="${testName}_time"></td>`;
      document.getElementById("result").appendChild(tr);
    }
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  },

  test: async function(test, program) {
    const input = document.getElementById(test + '_input').innerText;
    const expectedOutput = document.getElementById(test + '_output').innerText;
    const startTime = performance.now();
    let result = "AC";
    try {
      let output = await this.runProgram(program, input);
      if (!this.assert_equal(expectedOutput, output.trimEnd())) result = "WA";
    } catch (e) {
      result = "RE";
    }
    const execTime = (performance.now() - startTime).toFixed(0) + " ms";
    const span = '<span class="status ' + result.toLowerCase() +
                 '" title="' + result + '">' + this.dict[result] + '</span>';
    document.getElementById(test + "_status").innerHTML = span;
    document.getElementById(test + "_time").innerText = execTime;
    return result;
  },

  assert_equal: function(expected, actual) { return expected == actual; },

  escape: function(str) {
    return str.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
  }
};

window.addEventListener("DOMContentLoaded", event => {
  OnBrowserJudge.tests = Array.from(document.getElementsByTagName("pre")).map(
    elm => elm.id
  ).filter(id => {
    return id.match(/_input$/) && document.getElementById(id.replace(/_input$/, "_output"))
  }).map(
    id => id.replace(/_input$/, "")
  );

  Array.from(document.getElementsByClassName("sample")).forEach(elm => {
    elm.innerText = elm.innerText.trim();

    let button = document.getElementById(elm.id + "_copy");
    if (!button) {
      button = document.createElement("button");
      button.id = elm.id + "_copy";
      button.innerHTML = OnBrowserJudge.dict.copy;
      button.className = "copy";
      elm.parentNode.insertBefore(button, elm);
    }
    button.onclick = function() {
      navigator.clipboard.writeText(elm.innerText);
      this.innerHTML = OnBrowserJudge.dict.copied;
      setTimeout(() => { this.innerHTML = OnBrowserJudge.dict.copy }, 1500);
    };
  });
  OnBrowserJudge.runButton = document.getElementById("run");
  OnBrowserJudge.runButton.disabled = true;
  OnBrowserJudge.runButton.onclick = () => { OnBrowserJudge.run() };
});
