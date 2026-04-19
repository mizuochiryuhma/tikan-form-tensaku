// ★ Apps Script WebアプリURL
const ENDPOINT = "https://script.google.com/a/macros/gs.nein.ed.jp/s/AKfycbwV_C_xS0WX_hCIoPv6uYrnX6eedclw8SzVkN1EWYOW8FkCwEVix9Bq8Kw1HN016aTz/exec";

const form = document.getElementById("submitForm");
const studentNoEl = document.getElementById("studentNo");
const studentNameEl = document.getElementById("studentName");
const answerEl = document.getElementById("answer");

const countHint = document.getElementById("countHint");
const sendBtn = document.getElementById("sendBtn");

const resultCard = document.getElementById("resultCard");
const errorCard = document.getElementById("errorCard");
const errorText = document.getElementById("errorText");

const totalScore = document.getElementById("totalScore");
const scoreA = document.getElementById("scoreA");
const scoreB = document.getElementById("scoreB");
const scoreC = document.getElementById("scoreC");
const scoreD = document.getElementById("scoreD");
const adviceList = document.getElementById("adviceList");
const debugNote = document.getElementById("debugNote");

function countChars(s) {
  return (s || "").length;
}

answerEl.addEventListener("input", () => {
  countHint.textContent = `${countChars(answerEl.value)} 文字`;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();  // ★リロード防止

  resultCard.hidden = true;
  errorCard.hidden = true;

  const classChecked = document.querySelector('input[name="classNo"]:checked');
  const classNo = classChecked ? classChecked.value : "";

  const studentNo = studentNoEl.value.trim();
  const studentName = studentNameEl.value.trim();
  const answer = answerEl.value.trim();

  if (!classNo) return showError("クラス番号を選択してください。");
  if (!/^\d{1,3}$/.test(studentNo)) return showError("出席番号は1〜3桁の半角数字で入力してください。");
  if (!studentName) return showError("氏名を入力してください。");
  if (!answer) return showError("答案を入力してください。");

  sendBtn.disabled = true;
  sendBtn.textContent = "送信中…";

  try {
    const qs = new URLSearchParams({ classNo, studentNo, studentName, answer });
    const data = await jsonp(`${ENDPOINT}?${qs.toString()}`);

    if (data.error) throw new Error(data.message || "サーバーエラー");
    renderResult(data);
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    showError(err?.message || "不明なエラー");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "送信してAI採点";
  }
});

function showError(msg) {
  errorText.textContent = msg;
  errorCard.hidden = false;
}

function renderResult(data) {
  totalScore.textContent = data.total ?? "-";
  scoreA.textContent = data.A ?? "-";
  scoreB.textContent = data.B ?? "-";
  scoreC.textContent = data.C ?? "-";
  scoreD.textContent = data.D ?? "-";

  adviceList.innerHTML = "";
  (data.advice || []).forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a;
    adviceList.appendChild(li);
  });

  debugNote.textContent = data.note || "";
  resultCard.hidden = false;
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");

    window[cb] = (data) => {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      delete window[cb];
      script.remove();
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP load error"));
    };

    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cb}`;
    document.body.appendChild(script);
  });
}
