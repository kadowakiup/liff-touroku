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
        const data = await response.json(); 

        // GASで json.body を返しているので、data.options を参照
        if (data && data.options) {
            select.innerHTML = '<option value="">選択してください</option>';
            
            data.options.forEach(item => {
                const option = document.createElement("option");
                option.text = item.label;  // 氏名
                option.value = item.value; // ID
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Fetch error:", err);
        select.innerHTML = '<option value="">読み込み失敗</option>';
    }
}

document.getElementById("submitBtn").addEventListener("click", async () => {
    const select = document.getElementById("larkOptions");
    const selectedValue = select.value;
    const btn = document.getElementById("submitBtn");

    if (!selectedValue) return alert("氏名を選択してください");

    btn.disabled = true;
    btn.innerText = "送信中...";

    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({ selectedValue: selectedValue })
        });

        if (response.ok) {
            await liff.sendMessages([{ type: "text", text: "完了しました" }]);
            liff.closeWindow();
        }
    } catch (err) {
        alert("登録エラー");
        btn.disabled = false;
        btn.innerText = "登録ボタン";
    }
});