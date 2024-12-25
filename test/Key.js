const { soliditySha3 } = require("web3-utils");
const BigNumber = require("bignumber.js");

const fs = require("fs");
const path = require("path");

const { Parser } = require("@json2csv/plainjs");

const network = require(`../network/${
  process.env.npm_lifecycle_event.split(":")[1]
}.json`);

const KEY_ID = 1;
const DELIMITER = ",";
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function report(data) {
  try {
    console.log("__dirname: ", __dirname);
    const fields = Object.keys(data[0]);
    var str = fields.join(DELIMITER);
    data.forEach((element) => {
      str += "\n";
      str += Object.values(element).join(DELIMITER);
    });
    fs.writeFileSync(
      path.join(__dirname, `../report/price-list-${Date.now()}.csv`),
      str,
      { flag: "w" }
    );
  } catch (error) {
    console.error("reporting prices  fail:", error);
  }
}

const step = 1;
const All = 100;
describe("Key", () => {
  async function getContract(type) {
    const DmtpTech = await ethers.getContractFactory("DmtpTech");
    const DmtpTechContract = await DmtpTech.attach(
      network.contracts.DmtpTech.proxy
    );

    const Key = await ethers.getContractFactory("Key");
    const KeyContract = await Key.attach(network.contracts.Key.proxy);

    if (type == "DmtpTech") {
      return DmtpTechContract;
    }

    if (type == "Key") {
      return KeyContract;
    }

    return {
      DmtpTech: DmtpTechContract,
      Key: KeyContract,
    };
  }
  describe("Price", () => {
    it(`should get price of a key`, async () => {
      const contract = await getContract("Key");

      const arr = Array.from(Array(Math.floor(All / step) + 1).keys());
      let data = [];
      for (const groupIdx of arr) {
        const groupId = groupIdx;
        const items = Array.from(Array(step).keys());
        const result = await Promise.allSettled(
          items.map(async (idx) => {
            const keyNumber = idx + groupId * step;
            if (keyNumber > All - 1) {
              return {
                number_of_keys: -1,
              };
            }
            const buyKeys = await contract._priceOf(keyNumber);
            console.log("get price of key number...", keyNumber, buyKeys.toString());
            return {
              number_of_keys: keyNumber,
              buy_keys: new BigNumber(buyKeys),
            };
          })
        );

        data = data.concat(
          result.map((x) => x.value).filter((x) => x.number_of_keys >= 0)
        );

        await sleep(1000);
      }

      data = data.map((item, idx) => {
        if (idx == 0) {
          item.sell_keys = new BigNumber(0);
          item.spread = new BigNumber(0);
          item.spread_percent_for_sale = new BigNumber(0);
        } else {
          item.sell_keys = new BigNumber(data[idx - 1].buy_keys);
          item.spread = item.sell_keys.minus(item.buy_keys);
          if (item.sell_keys == 0) {
            item.spread_percent_for_sale = new BigNumber(0);
          } else {
            item.spread_percent_for_sale = item.spread.div(item.sell_keys);
          }
        }

        return {
          number_of_keys: item.number_of_keys,
          buy_keys: item.buy_keys.div(1e18).toString(),
          sell_keys: item.sell_keys.div(1e18).toString(),
          spread: item.spread.div(1e18).toString(),
          spread_percent_for_sale: item.spread_percent_for_sale
            .multipliedBy(100)
            .toFixed(2),
        };
      });
      report(data);
    });
  });
  //  describe("Total Supply", () => {
  //    it(`should return total supply  of a key`, async () => {
  //      const contract = await Key.at(network.contracts.Key.proxy);
  //
  //      const result = await contract.totalSupply(KEY_ID);
  //      console.log("totalSupply: ", result.toString());
  //    });
  //  });
});
