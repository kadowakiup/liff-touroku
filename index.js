const GAS_URL = "https://script.google.com/macros/s/AKfycbyV2-Dc_QfGcpK1ZJPaHXS7pTvBmEcof0EV4Xv-utTSHnKiQGHprJzHyMNg8JeiNYDEXA/exec";

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
        const text = await response.text(); // 一旦テキストで受ける（解析エラー対策）
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("GASのレスポンスがJSONではありません: " + text);
        }

        if (data.success && data.options) {
            select.innerHTML = '<option value="">選択してください</option>';
            data.options.forEach(item => {
                const option = document.createElement("option");
                option.text = item.label;
                option.value = item.value;
                select.appendChild(option);
            });
        } else {
            // エラー内容を詳細に表示
            alert("データ取得失敗\n理由: " + data.message + "\nAnycross返却値: " + data.anycrossRaw);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        alert("システムエラーが発生しました\n" + err.message);
        select.innerHTML = '<option value="">読み込み失敗</option>';
    }
}

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