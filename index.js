const GAS_URL = "https://script.google.com/macros/s/AKfycbxP-3ye0KQn1hcnO1E5XUWyhib-A0fu_skxnVBOe1kt1tKS7Phgs5Ul_UtzFzQ2Umof/exec";

let allOptions = [];
let currentSelectedName = "";

document.addEventListener("DOMContentLoaded", () => {
    liff.init({ liffId: "2009827198-qvnHhjxl" })
        .then(() => {
            if (!liff.isLoggedIn()) {
                liff.login();
            } else {
                fetchOptions();
            }
        });
});

async function fetchOptions() {
    const display = document.getElementById("selectedDisplay");
    try {
        const idToken = liff.getIDToken(); // ★ トークン取得
        const response = await fetch(`${GAS_URL}?idToken=${encodeURIComponent(idToken)}&t=${Date.now()}`);
        const data = await response.json();

        if (data.success && data.options) {
            allOptions = data.options;
            display.textContent = "ここをタップして選択";
            renderOptions(allOptions);
        } else {
            // ★ 期限切れなら再ログイン
            if (data.message && data.message.includes("セッション切れ")) {
                liff.logout(); liff.login(); return;
            }
            alert("データ取得失敗\n" + (data.message || ""));
        }
    } catch (err) {
        console.error("Fetch error:", err);
        display.textContent = "読み込み失敗";
    }
}

function renderOptions(options) {
    const container = document.getElementById("optionsContainer");
    container.innerHTML = ""; 
    
    if (options.length === 0) {
        container.innerHTML = '<div style="padding: 10px; color: #999;">見つかりませんでした</div>';
        return;
    }

    options.forEach(item => {
        const div = document.createElement("div");
        div.className = "option-item";
        div.textContent = item.label;
        div.addEventListener("click", () => {
            currentSelectedName = item.label; 
            document.getElementById("selectedDisplay").textContent = item.label;
            document.getElementById("dropdownList").classList.remove("show");
            document.getElementById("searchInput").value = "";
            renderOptions(allOptions);
        });
        container.appendChild(div);
    });
}

document.getElementById("selectedDisplay").addEventListener("click", () => {
    if (allOptions.length === 0) return;
    document.getElementById("dropdownList").classList.toggle("show");
});

document.getElementById("searchInput").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allOptions.filter(item => 
        item.label.toLowerCase().includes(keyword)
    );
    renderOptions(filtered);
});

document.addEventListener("click", (e) => {
    const customSelect = document.getElementById("customSelect");
    if (!customSelect && !customSelect.contains(e.target)) {
        document.getElementById("dropdownList").classList.remove("show");
    }
});

// 登録ボタンの処理
document.getElementById("submitBtn").addEventListener("click", async () => {
    const btn = document.getElementById("submitBtn");
    if (!currentSelectedName) return alert("氏名を選択してください");

    btn.disabled = true;
    btn.innerText = "送信中...";

    try {
        const idToken = liff.getIDToken(); // ★ トークン取得

        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({ 
                selectedName: currentSelectedName, 
                idToken: idToken // ★ トークンを送信
            })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            alert(data.message || "登録が完了しました！");
            if (liff.isInClient()) {
                liff.closeWindow(); 
            } else {
                document.body.innerHTML = '<div style="text-align:center; padding:50px; margin-top:50px; font-weight:bold; color:#00B900;">登録が完了しました。<br>この画面を閉じてください。</div>';
            }
        } else {
            alert("更新失敗: " + (data.message || ""));
            btn.disabled = false;
            btn.innerText = "登録する";
        }
    } catch (err) {
        alert("通信エラー: " + err.message + "：先にメニュー「登録」から自分の名前を登録してください");
        btn.disabled = false;
        btn.innerText = "登録する";
    }
});


