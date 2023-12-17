require('dotenv').config(); // 确保已安装dotenv包来管理环境变量

const AlipaySdk = require("alipay-sdk").default;

// 使用环境变量来存储敏感信息
const appId = process.env.ALIPAY_APP_ID;
const privateKey = process.env.ALIPAY_PRIVATE_KEY;
const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
const GATEWAY = process.env.GATEWAY;

const alipaySdk = new AlipaySdk({
    appId: appId,
    privateKey: privateKey,
    alipayPublicKey: alipayPublicKey,
    gateway: GATEWAY,
});

async function createAlipayOrder(orderId, totalAmount, subject) {
    try {
        const result = await alipaySdk.exec("alipay.trade.precreate", {
            bizContent: {
                out_trade_no: orderId,
                total_amount: totalAmount,
                subject: subject,
            },
        });
        return result;
    } catch (error) {
        throw error;
    }
}


const express = require('express')
const app = express()
const port = 3000

const sleep = async (time = 3000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time);
    })
}

app.get('/', async (req, res) => {
    // 示例调用
    const orderId = req.query.orderId; // 从查询参数获取订单号
    const totalAmount = req.query.totalAmount; // 从查询参数获取总金额
    const subject = req.query.subject; // 从查询参数获取商品名称

    try {
        const orderResult = await createAlipayOrder(orderId, totalAmount, subject);
        console.log('订单创建成功:', orderResult);

        const { outTradeNo } = orderResult

        let startTime = Date.now()
        while ((Date.now() - startTime) <= 1000 * 60) {
            await sleep()
            const result = await alipaySdk.exec("alipay.trade.query", {
                bizContent: {
                    out_trade_no: outTradeNo,
                },

            });
            if (result.trade_status === 'TRADE_SUCCESS') {
                console.log('-----------success------------')
                console.log(JSON.stringify(result))

                res.send(JSON.stringify(error))
                break
            } else {
                console.log('Date.now() - startTime', Date.now() - startTime)
                console.log(JSON.stringify(result))
            }
        }

    } catch (error) {
        console.error('订单创建失败:', error);
        res.send(JSON.stringify(error))
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})