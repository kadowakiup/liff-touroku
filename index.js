const GAS_URL = "https://script.google.com/macros/s/AKfycbyV2-Dc_QfGcpK1ZJPaHXS7pTvBmEcof0EV4Xv-utTSHnKiQGHprJzHyMNg8JeiNYDEXA/exec"; // ※デプロイURLを入れてください

let allOptions = [];
let currentSelectedName = ""; // 名前（label）を保存する変数に変更

document.addEventListener("DOMContentLoaded", () => {
    liff.init({ liffId: "2009569390-tiaTgyA0" })
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
        const response = await fetch(GAS_URL);
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("JSON解析エラー");
        }

        if (data.success && data.options) {
            allOptions = data.options;
            display.textContent = "ここをタップして選択"; // 初期テキスト
            renderOptions(allOptions);
        } else {
            alert("データ取得失敗\n" + data.anycrossRaw);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        display.textContent = "読み込み失敗";
    }
}

// プルダウンの中身を作る関数
function renderOptions(options) {
    const container = document.getElementById("optionsContainer");
    container.innerHTML = ""; // 中身をリセット
    
    if (options.length === 0) {
        container.innerHTML = '<div style="padding: 10px; color: #999;">見つかりませんでした</div>';
        return;
    }

    options.forEach(item => {
        const div = document.createElement("div");
        div.className = "option-item";
        div.textContent = item.label;
        
        div.addEventListener("click", () => {
            // 修正箇所: item.value ではなく item.label を保存する
            currentSelectedName = item.label; 
            
            document.getElementById("selectedDisplay").textContent = item.label;
            document.getElementById("dropdownList").classList.remove("show");
            document.getElementById("searchInput").value = "";
            renderOptions(allOptions);
        });
        
        container.appendChild(div);
    });
}

// 「ここをタップして選択」を押したときにリストを開閉する
document.getElementById("selectedDisplay").addEventListener("click", () => {
    // 読み込みが完了していない時は開かない
    if (allOptions.length === 0) return;
    document.getElementById("dropdownList").classList.toggle("show");
});

// 検索窓に文字が入力されたら絞り込む
document.getElementById("searchInput").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allOptions.filter(item => 
        item.label.toLowerCase().includes(keyword)
    );
    renderOptions(filtered);
});

// プルダウンの枠外をタップしたらリストを閉じる
document.addEventListener("click", (e) => {
    const customSelect = document.getElementById("customSelect");
    if (!customSelect.contains(e.target)) {
        document.getElementById("dropdownList").classList.remove("show");
    }
});

// 登録ボタンの処理
document.getElementById("submitBtn").addEventListener("click", async () => {
    const btn = document.getElementById("submitBtn");

    // 氏名が選ばれているかチェック
    if (!currentSelectedValue) return alert("氏名を選択してください");

    btn.disabled = true;
    btn.innerText = "送信中...";

    try {
        // ★LIFFからLINEプロフィールを取得し、ユーザーIDを取り出す
        const profile = await liff.getProfile();
        const lineUserId = profile.userId;

        // GASへデータを送信
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({ 
                selectedName: currentSelectedName, // キー名をselectedNameなどに変更
                lineId: lineUserId 
            })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            await liff.sendMessages([{ type: "text", text: "完了しました" }]);
            liff.closeWindow();
        } else {
            alert("更新失敗: " + (data.message || ""));
            btn.disabled = false;
            btn.innerText = "登録ボタン";
        }
    } catch (err) {
        alert("通信エラー: " + err.message);
        btn.disabled = false;
        btn.innerText = "登録ボタン";
    }
});