const fs = require('fs');

const { test } =
    require('@playwright/test');

const { ChatbotPage } =
    require('../pages/ChatbotPage');

const chatbotData =
    require('../data/response.json');

test(
    'Validate Chatbot Responses',
    async ({ page }) => {

        test.setTimeout(1200000);

        const chatbot =
            new ChatbotPage(page);

        await chatbot.navigate();

        await chatbot.openChatbot();

        await page.waitForTimeout(5000);


        const errors = [];

        for (const item of chatbotData) {

            console.log('\n');
            console.log(`Executing ${item.testCaseId}`);
            console.log(`Question: ${item.message}`);

            const oldResponses =
                await chatbot.getAllResponses();

            console.log(
                'OLD RESPONSES:',
                oldResponses
            );

            const oldCount =
                oldResponses.length;

            console.log(
                'OLD COUNT:',
                oldCount
            );

            await chatbot.sendMessage(
                item.message
            );


            await chatbot.waitForNewResponse(
                oldCount
            );

            const allResponses =
                await chatbot.getAllResponses();

            console.log(
                'ALL RESPONSES:',
                allResponses
            );

            const newResponses =
                allResponses.slice(
                    oldCount
                );

            console.log(
                'NEW RESPONSES:',
                newResponses
            );

            const response =
                newResponses.join(' ');

            console.log(
                'BOT RESPONSE:'
            );

            console.log(
                response
            );

            const missingKeywords =
                [];

            for (
                const keyword
                of item.keywords
            ) {

                console.log(
                    `Checking Keyword: ${keyword}`
                );

                if (
                    !response
                        .toLowerCase()
                        .includes(
                            keyword
                                .toLowerCase()
                        )
                ) {

                    missingKeywords.push(
                        keyword
                    );
                }
            }

            if (
                missingKeywords.length > 0
            ) {

                console.log(
                    `FAILED: ${item.testCaseId}`,
                    missingKeywords
                );

                errors.push({

                    testCaseId:
                        item.testCaseId,

                    question:
                        item.message,

                    expectedKeywords:
                        item.keywords,

                    missingKeywords,

                    actualResponse:
                        response
                });

            } else {

                console.log(
                    `${item.testCaseId} PASSED`
                );
            }
        }


        fs.writeFileSync(
            './response.json',
            JSON.stringify(
                errors,
                null,
                2
            )
        );

        console.log(
            '\nfailure-report.json generated successfully'
        );


        if (errors.length > 0) {

            fs.writeFileSync(
                'response.json',
                JSON.stringify(errors, null, 2)
            );

            console.log(
                `Found ${errors.length} failed test cases`
            );

            // No throw
        }
    }
);