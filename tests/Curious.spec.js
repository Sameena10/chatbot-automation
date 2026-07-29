const fs = require('fs');
const { test } = require('@playwright/test');

const { ChatbotPage } = require('../pages/ChatbotPage');

const chatbotData = require('../data/CuriousConvo.json');

test('Validate Chatbot Responses', async ({ page }) => {

    test.setTimeout(2400000);

    const suiteStartTime = Date.now();

    const chatbot = new ChatbotPage(page);

    await chatbot.navigate();
    await chatbot.openChatbot();

    await page.waitForTimeout(5000);

    const errors = [];
    const testResults = [];

    console.log(`Journey: ${chatbotData.journey}`);
    console.log(`Total Test Cases: ${chatbotData.testCases.length}`);

    for (const item of chatbotData.testCases) {

        console.log("\n");
        console.log(`Executing: ${item.id}`);
        console.log(`Question : ${item.userMessage}`);
        console.log("");

        const oldResponses = await chatbot.getAllResponses();
        const oldCount = oldResponses.length;

        console.log(`Existing Responses: ${oldCount}`);

        await chatbot.sendMessage(item.userMessage);

        await chatbot.waitForNewResponse(oldCount);

        const allResponses = await chatbot.getAllResponses();

        const newResponses = allResponses.slice(oldCount);

        const response = newResponses.join(" ");

        console.log("\nBot Response:");
        console.log(response);

        const matchedKeywords = [];
        const missingKeywords = [];

        for (const keyword of item.expectedKeywords) {

            console.log(`Checking Keyword -> ${keyword}`);

            if (
                response
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
            ) {
                matchedKeywords.push(keyword);
            } else {
                missingKeywords.push(keyword);
            }
        }

        const matchPercentage = Number(
            (
                (matchedKeywords.length /
                    item.expectedKeywords.length) * 100
            ).toFixed(2)
        );

        const status =
            matchedKeywords.length > 0
                ? "PASS"
                : "FAIL";

        console.log(`Status          : ${status}`);
        console.log(`Match Percentage: ${matchPercentage}%`);
        console.log(`Matched         : ${matchedKeywords.join(", ")}`);
        console.log(`Missing         : ${missingKeywords.join(", ")}`);

        testResults.push({

            testCaseId: item.id,

            question: item.userMessage,

            expectedKeywords: item.expectedKeywords,

            matchedKeywords,

            missingKeywords,

            matchPercentage,

            actualResponse: response,

            status

        });

        if (status === "FAIL") {

            console.log(`${item.id} FAILED`);

            errors.push({

                testCaseId: item.id,

                question: item.userMessage,

                expectedKeywords: item.expectedKeywords,

                matchedKeywords,

                missingKeywords,

                matchPercentage,

                actualResponse: response,

                status

            });

        } else {

            console.log(`${item.id} PASSED`);

        }

        console.log("");
    }

    const suiteExecutionTime = Date.now() - suiteStartTime;

    const totalTestCases = chatbotData.testCases.length;

    const failed = errors.length;

    const passed = totalTestCases - failed;

    const report = {

        journey: chatbotData.journey,

        executionDate: new Date().toISOString(),

        totalTestCases,

        passed,

        failed,

        passPercentage: Number(
            (
                (passed / totalTestCases) * 100
            ).toFixed(2)
        ),

        totalExecutionTimeInMs: suiteExecutionTime,

        testResults,

        failedTestCases: errors

    };

    fs.mkdirSync("./test-results", {
        recursive: true
    });

    fs.writeFileSync(
        "./test-results/CuriousConvo-report.json",
        JSON.stringify(report, null, 2)
    );

    console.log("\n");
    console.log("Report generated successfully.");
    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log(`Pass % : ${report.passPercentage}%`);
    console.log(`Execution Time : ${suiteExecutionTime} ms`);
    console.log("");

    if (errors.length > 0) {

        console.log("Failed Test Case Summary\n");

        errors.forEach(error => {

            console.log(`Test Case : ${error.testCaseId}`);
            console.log(`Question  : ${error.question}`);
            console.log(`Matched   : ${error.matchedKeywords.join(", ")}`);
            console.log(`Missing   : ${error.missingKeywords.join(", ")}`);
            console.log(`Response  : ${error.actualResponse}`);
            console.log("");

        });

    }

});