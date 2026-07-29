const { test } = require('@playwright/test');
const fs = require('fs');

const { ChatbotPage } = require('../pages/ChatbotPage');
const testData = require('../data/FinanceEnglish.json');

test.setTimeout(20 * 60 * 1000);

test('Validate Finance Chatbot Responses', async ({ page }) => {

    const suiteStartTime = Date.now();

    const chatbot = new ChatbotPage(page);

    const errors = [];
    const testResults = [];

    try {

        await chatbot.navigate();

        await chatbot.openChatbot();

        await page.waitForTimeout(5000);

        console.log(`Journey: ${testData.journey}`);
        console.log(`Total Test Cases: ${testData.testCases.length}`);

        for (const tc of testData.testCases) {

            console.log("\n");
            console.log(`Executing: ${tc.id}`);
            console.log(`Question : ${tc.userMessage}`);
            console.log("");

            try {

                const startTime = Date.now();

                const oldResponses = await chatbot.getAllResponses();
                const oldCount = oldResponses.length;

                console.log(`Existing Responses: ${oldCount}`);

                await chatbot.sendMessage(tc.userMessage);

                await chatbot.waitForNewResponse(oldCount);

                const allResponses = await chatbot.getAllResponses();

                const newResponses = allResponses.slice(oldCount);

                const actualResponse = newResponses.join(" ");

                const responseTime = Date.now() - startTime;

                const matchedKeywords = [];
                const missingKeywords = [];

                for (const keyword of tc.expectedKeywords) {

                    console.log(`Checking Keyword -> ${keyword}`);

                    if (
                        actualResponse
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
                            tc.expectedKeywords.length) * 100
                    ).toFixed(2)
                );

                const status =
                    matchedKeywords.length > 0
                        ? "PASS"
                        : "FAIL";

                console.log(`Status          : ${status}`);
                console.log(`Match Percentage: ${matchPercentage}%`);
                console.log(`Response Time   : ${responseTime} ms`);
                console.log(`Matched         : ${matchedKeywords.join(", ")}`);
                console.log(`Missing         : ${missingKeywords.join(", ")}`);
                console.log(`Response        : ${actualResponse}`);

                const result = {

                    testCaseId: tc.id,

                    question: tc.userMessage,

                    expectedKeywords: tc.expectedKeywords,

                    matchedKeywords,

                    missingKeywords,

                    matchPercentage,

                    actualResponse,

                    responseTimeInMs: responseTime,

                    status

                };

                testResults.push(result);

                if (status === "FAIL") {

                    errors.push(result);

                }

            } catch (err) {

                console.log(`ERROR : ${err.message}`);

                const errorResult = {

                    testCaseId: tc.id,

                    question: tc.userMessage,

                    expectedKeywords: tc.expectedKeywords,

                    matchedKeywords: [],

                    missingKeywords: tc.expectedKeywords,

                    matchPercentage: 0,

                    actualResponse: "",

                    responseTimeInMs: 0,

                    status: "ERROR",

                    error: err.message

                };

                testResults.push(errorResult);

                errors.push(errorResult);

            }

            await page.waitForTimeout(1000);

        }

    } catch (err) {

        console.error("Fatal Error:", err.message);

        throw err;

    } finally {

        const suiteExecutionTime = Date.now() - suiteStartTime;

        const totalTestCases = testData.testCases.length;

        const failed = errors.length;

        const passed = totalTestCases - failed;

        const report = {

            journey: testData.journey,

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
            "./test-results/Finance_Report.json",
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

    }

});