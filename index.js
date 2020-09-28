const pup = require('puppeteer');
const fs = require('fs');

const scrapeUser = async (username, page) => {
    try { 
        await page.goto(`https://twitter.com/${username}`);
        await page.waitForSelector('div[data-testid="UserProfileHeader_Items"] .r-qvutc0, a.css-901oao > span');
        // await page.waitForSelector('a.css-901oao');

        const info = await page.evaluate(() => {
            const headerNodes = document.querySelectorAll('div[data-testid="UserProfileHeader_Items"] .r-qvutc0');
            let joinedNode = null;
            for (let i = 0; i < headerNodes.length; i++) {
                const currentNode = headerNodes[i];
                if (currentNode?.innerText.includes('Joined')) {
                    joinedNode = currentNode;
                }
            }
            const descriptionNode = document.querySelector('div[data-testid="UserDescription"]');
            const followDataNodes = document.querySelectorAll('a.css-901oao > span');

            console.log(followDataNodes)

            return {
                joined: joinedNode?.innerText.split('Joined').join('').trim() || 'Error: Joined date is not specified',
                description: descriptionNode?.innerText.trim() || 'Error: Description does not exist',
                following: followDataNodes[0]?.innerText.trim() || 'Error: Following count not found',
                followers: followDataNodes[2]?.innerText.trim() || 'Error: Follwers count not found',
            }
        })


        // fs.writeFile("basic.json", JSON.stringify({ username, ...info }), function(err) {
        //     if (err) throw err;
        //     console.log("Saved!");
        // });
        return { username, ...info }
    } catch (e) {
        console.error(e)
    }
}

const scrapeAll = async (usernameList) => {
    try {
        const browser = await pup.launch({headless: false, args: ['--disable-setuid-sandbox', '--no-sandbox']});
        const page = await browser.newPage();
        let data = [];
        for (let i = 0; i < usernameList.length; i++) {
            const res = await scrapeUser(usernameList[i], page);
            data.push(res);
        }
        await browser.close();

        fs.writeFile("domp.json", JSON.stringify(data), function(err) {
            if (err) throw err;
            console.log("Task failed successfully :D")
        })
    } catch(e) {
        console.error(e)
    }
}

const resetUser = async (username) => {
    try { 
        const browser = await pup.launch({headless: false, args: ['--disable-setuid-sandbox', '--no-sandbox']});
        const page = await browser.newPage();
        await page.goto(`https://twitter.com/account/begin_password_reset`);
        await page.waitForSelector('input.is-required');
        const elementHandle = await page.$('input.is-required');
        await elementHandle.type(username);
        await elementHandle.press('Enter');
        await page.waitForSelector('.Form-radioList label');

        const info = await page.evaluate(async () => {
            const optionNodes = document.querySelectorAll('strong');
            return {
                phone: optionNodes[0].innerText.trim(),
                email: optionNodes[1].innerText.trim(),
            }
        })

        await browser.close();

        // fs.writeFile("recovery.json", JSON.stringify({ username, ...info }), function(err) {
        //     if (err) throw err;
        //     console.log("Saved!");
        // });
        return { username, ...info }
    } catch (e) {
        console.error(e)
    }
}

const usernames = fs.readFileSync('uniq.txt').toString().split("\n");

scrapeAll(usernames)

// scrapeUser('robgev_').then(res => { console.log(res) })
