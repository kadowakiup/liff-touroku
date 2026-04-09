const GAS_URL = "https://script.google.com/macros/s/AKfycbyV2-Dc_QfGcpK1ZJPaHXS7pTvBmEcof0EV4Xv-utTSHnKiQGHprJzHyMNg8JeiNYDEXA/exec";
let allOptions = []; // 取得した全データを保持する変数

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
    const select = document.getElementById("larkOptions");
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json(); 

        if (data.success && data.options) {
            allOptions = data.options; // データを保存
            renderOptions(allOptions); // プルダウンを表示
        } else {
            alert("データ取得失敗: " + data.anycrossRaw);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        select.innerHTML = '<option value="">読み込み失敗</option>';
    }
}

// プルダウンの中身を描画する共通関数
function renderOptions(options) {
    const select = document.getElementById("larkOptions");
    select.innerHTML = '<option value="">選択してください</option>';
    
    options.forEach(item => {
        const option = document.createElement("option");
        option.text = item.label;
        option.value = item.value;
        select.appendChild(option);
    });
}

// 検索窓に文字が入力された時の処理
document.getElementById("searchInput").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase(); // 小文字に統一して検索
    
    // 全データからキーワードが含まれるものだけを抽出
    const filtered = allOptions.filter(item => 
        item.label.toLowerCase().includes(keyword)
    );
    
    renderOptions(filtered); // 絞り込んだ結果を再描画
});

document.getElementById("submitBtn").addEventListener("click", async () => {
    const selectedValue = document.getElementById("larkOptions").value;
    const btn = document.getElementById("submitBtn");

    if (!selectedValue) return alert("氏名を選択してください");

    btn.disabled = true;
    btn.innerText = "送信中...";

    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({ selectedValue: selectedValue })
        });
        const data = await response.json();

        if (response.ok) {
            await liff.sendMessages([{ type: "text", text: "完了しました" }]);
            liff.closeWindow();
        } else {
            alert("更新失敗: " + JSON.stringify(data));
            btn.disabled = false;
            btn.innerText = "登録ボタン";
        }
    } catch (err) {
        alert("通信エラー: " + err.message);
        btn.disabled = false;
        btn.innerText = "登録ボタン";
    }
});