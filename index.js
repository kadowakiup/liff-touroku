const GAS_URL = "https://script.google.com/macros/s/AKfycbyV2-Dc_QfGcpK1ZJPaHXS7pTvBmEcof0EV4Xv-utTSHnKiQGHprJzHyMNg8JeiNYDEXA/exec";

document.addEventListener("DOMContentLoaded", function() {
    // LIFFの初期化
    liff.init({ liffId: "2009569390-tiaTgyA0" })
        .then(() => {
            if (!liff.isLoggedIn()) {
                liff.login();
            } else {
                fetchOptions();
            }
        })
        .catch((err) => console.error("LIFF Initialization failed", err));
});

// GAS経由でプルダウンの選択肢を取得
// 取得時（GASのdoGetが呼ばれる）
async function fetchOptions() {
    try {
        const response = await fetch(GAS_URL); // GASのdoGetへ
        const data = await response.json();
        // ...以下、プルダウン生成処理...
    } catch (err) {
        console.error("取得エラー:", err);
    }
}

// 登録時（GASのdoPostが呼ばれる）
document.getElementById("submitBtn").addEventListener("click", async () => {
    const select = document.getElementById("larkOptions");
    const selectedValue = select.value;

    try {
        const response = await fetch(GAS_URL, {
            method: "POST", // GASのdoPostへ
            body: JSON.stringify({
                selectedValue: selectedValue
            })
        });
        
        if (response.ok) {
            await liff.sendMessages([{ type: "text", text: "完了しました" }]);
            liff.closeWindow();
        }
    } catch (err) {
        console.error("更新エラー:", err);
    }
});