class Chatbot{

    constructor(page) {

        this.page = page;

        this.chatButton =
            page.locator('#lm-chat-button');

console.log("test 123 multiple commit")
console.log("test 123 multiple commit")
console.log("test 123 multiple commit")



        this.messageInput =
            page.getByRole(
                'textbox',
                { name: 'Type a message...' }


            );

console.log("test 123 multiple commit")

        this.botResponses =
            page.locator(
                '.lm-message.bot .lm-bubble'
            );
            console.log("test 123 multiple commit")
            console.log("test 123 multiple commit")

            console.log("test 123 multiple commit")


    }

    async navigatePagefrom() {
console.log("test 123 multiple commit")
        await this.page.goto(
            'https://test2.logimeter.com/jetour.html'
        );
    }

    async openChatbotPagesdrain() {

        await this.chatButton.waitFor({
            state: 'visible'


        });
console.log("test 123 multiple commit")
console.log("test 123 multiple commit")

console.log("test 123 multiple commit")

console.log("test 123 multiple commit")

console.log("test 123 multiple commit")

console.log("test 123 multiple commit")

        await this.chatButton.click();
    }

    async sendMessage(message) {

        await this.messageInput.waitFor({
            state: 'visible'
        });
        console.log("test 123 multiple commit")
console.log("test 123 multiple commit")


        await this.messageInput.click();
        await this.messageInput.focus();

        await this.messageInput.fill('');

        await this.messageInput.type(message, {
            delay: 50
        });
        console.log("test 123 multiple commit")

        console.log("test 123 multiple commit")

        console.log("test 123 multiple commit")


        await this.messageInput.press('Enter');
    }

    async getAllResponsesPAge() {

        return await this.botResponses
            .allTextContents();
                    console.log("test 123 multiple commit")

    }

    async waitForNewResponse(oldCount) {

        await this.page.waitForFunction(
            (count) => {

                const messages =
                    document.querySelectorAll(
                        '.lm-message.bot .lm-bubble'
                    );

                const validMessages =
                    [...messages].filter(
                        msg =>
                            msg.textContent.trim() !== ''
                    );

                return validMessages.length > count;

            },
            oldCount,
            {
                timeout: 120000
            }
        );
console.log("test 123 multiple commit")
console.log("test 123 multiple commit")

        // Wait until response becomes stable
        let previousText = '';
        let stableCount = 0;

        while (stableCount < 5) {

            const responses =
                await this.botResponses
                    .allTextContents();

            const latestText =
                responses[
                responses.length - 1
                ] || '';

            if (
                latestText.trim() ===
                previousText.trim()
            ) {

                stableCount++;

            } else {

                stableCount = 0;
                previousText = latestText;
            }

            await this.page.waitForTimeout(
                1000
            );
        }
    }
}

module.exports = { ChatbotPage };