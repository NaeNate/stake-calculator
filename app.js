document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault()

  let bal = 0

  const net = document.querySelector("#net")

  const depositsFile = document.querySelector("#deposits").files[0]
  const withdrawalsFile = document.querySelector("#withdrawals").files[0]

  const priceCache = {}

  async function getPrice(coin) {
    if (!priceCache[coin]) {
      const { data } = await fetch(
        `https://api.coinbase.com/v2/prices/${coin}-usd/spot`
      ).then((res) => res.json())

      priceCache[coin] = parseFloat(data.amount)
    }

    return priceCache[coin]
  }

  async function processFile(file, operation) {
    const url = URL.createObjectURL(file)
    const text = await fetch(url).then((res) => res.text())

    const rows = text.split("\n")

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]

      if (row) {
        const [, amount, coin] = row.split(",")

        const pricePerCoin = await getPrice(coin)
        bal += operation * amount * pricePerCoin
      }
    }

    URL.revokeObjectURL(url)
  }

  await processFile(depositsFile, -1)
  await processFile(withdrawalsFile, 1)

  bal = parseFloat(bal) + parseFloat(document.querySelector("#current").value)
  net.textContent = "Total Profit: " + bal.toFixed(2)
})
