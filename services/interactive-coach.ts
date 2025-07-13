import readline from "readline";
import { gptService } from "./api";
import { RELATIONSHIP_COACH_SYSTEM_PROMPT, STYLE_PROMPTS } from "./config/prompts";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class RelationshipCoach {
    constructor(style = "casual") {
        this.conversationHistory = [];
        this.style = style;
        this.personalInfo = {
            name: null,
            preferences: []
        };
    }

    setStyle(style) {
        if (STYLE_PROMPTS[style]) {
            this.style = style;
            this.clearHistory();
            return true;
        }
        return false;
    }

    setName(name) {
        this.personalInfo.name = name;
    }

    addPreference(preference) {
        this.personalInfo.preferences.push(preference);
    }

    clearPreferences() {
        this.personalInfo.preferences = [];
    }

    getCurrentPrompt() {
        let basePrompt = STYLE_PROMPTS[this.style] || RELATIONSHIP_COACH_SYSTEM_PROMPT;
        
        // 将个人信息作为系统背景知识，而非用户消息的一部分
        if (this.personalInfo.name || this.personalInfo.preferences.length > 0) {
            basePrompt += "\n\n背景信息（仅在相关时自然使用，大多数情况下不需要提及）：";
            if (this.personalInfo.name) {
                basePrompt += `\n- 对方名字：${this.personalInfo.name}`;
            }
            if (this.personalInfo.preferences.length > 0) {
                basePrompt += `\n- 了解的信息：${this.personalInfo.preferences.join("、")}`;
            }
            basePrompt += "\n\n记住：这些信息是帮助你更好理解对方，不是每次都要提及的内容。";
        }
        
        return basePrompt;
    }

    async getAdvice(userMessage) {
        try {
            // 不再将个人信息附加到每条消息
            this.conversationHistory.push({ role: "user", content: userMessage });

            const messages = [
                { role: "system", content: this.getCurrentPrompt() },
                ...this.conversationHistory
            ];

            const completion = await openai.chat.completions.create({
                model: "chatgpt-4o-latest",
                stream: false,
                messages: messages,
                temperature: 0.9,
                max_tokens: 200
            });

            const assistantResponse = completion.choices[0].message;
            this.conversationHistory.push(assistantResponse);

            return assistantResponse.content;
        } catch (error) {
            console.error("获取建议时出错：", error);
            throw error;
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getInfo() {
        let info = `Style: ${this.style}`;
        if (this.personalInfo.name) {
            info += `\nName: ${this.personalInfo.name}`;
        }
        if (this.personalInfo.preferences.length > 0) {
            info += `\nPreferences: ${this.personalInfo.preferences.join(", ")}`;
        }
        return info;
    }
}

async function main() {
    const coach = new RelationshipCoach();
    
    console.log("=".repeat(60));
    console.log("💬 Multilingual Reply Generator | 多语言聊天回复生成器");
    console.log("🌍 Auto-detects language and cultural context");
    console.log("=".repeat(60));
    console.log("\n✨ Input in any language / 输入任何语言");
    console.log("\n📝 Commands / 命令:");
    console.log("  'clear' = reset chat / 清空记录");
    console.log("  'style [flirty/funny/casual]' = change style / 切换风格");
    console.log("  'name [名字]' = set their name / 设置对方名字");
    console.log("  'like [信息]' = add preference / 添加对方喜好");
    console.log("  'reset likes' = clear all preferences / 清空所有喜好");
    console.log("  'info' = show current settings / 显示当前设置");
    console.log("  'exit/quit' = leave / 退出\n");
    
    console.log("💡 Tips: Add personal info for better replies!");
    console.log("   Example: name Emma → like loves coffee → like plays tennis");
    console.log("   示例: name 小雨 → like 喜欢奶茶 → like 追星周杰伦\n");

    console.log(coach.getInfo() + "\n");

    const askQuestion = () => {
        rl.question("💭 Input / 输入: ", async (input) => {
            const trimmedInput = input.trim();
            const cmd = trimmedInput.toLowerCase();

            if (cmd.startsWith("style ")) {
                const styleOption = cmd.split(" ")[1];
                if (coach.setStyle(styleOption)) {
                    console.log(`\n🎨 Style changed to ${styleOption}!`);
                    console.log(coach.getInfo() + "\n");
                } else {
                    console.log("\n❓ Unknown style. Options: flirty, funny, casual\n");
                }
                askQuestion();
                return;
            }

            if (cmd.startsWith("name ")) {
                const name = trimmedInput.substring(5).trim();
                coach.setName(name);
                console.log(`\n✅ Name set to: ${name}`);
                console.log(coach.getInfo() + "\n");
                askQuestion();
                return;
            }

            if (cmd.startsWith("like ")) {
                const preference = trimmedInput.substring(5).trim();
                coach.addPreference(preference);
                console.log(`\n✅ Added preference: ${preference}`);
                console.log(coach.getInfo() + "\n");
                askQuestion();
                return;
            }

            if (cmd === "reset likes") {
                coach.clearPreferences();
                console.log("\n🗑️ All preferences cleared!\n");
                askQuestion();
                return;
            }

            if (cmd === "info") {
                console.log(`\n${coach.getInfo()}\n`);
                askQuestion();
                return;
            }
            
            if (cmd === 'exit' || cmd === 'quit') {
                console.log("\n✨ Bye! / 再见！\n");
                rl.close();
                return;
            }
            
            if (cmd === 'clear') {
                coach.clearHistory();
                console.log("\n💫 Chat history cleared! / 聊天记录已清空！\n");
                askQuestion();
                return;
            }
            
            if (!trimmedInput) {
                console.log("\n🤔 Please say something... / 请输入内容...\n");
                askQuestion();
                return;
            }
            
            console.log("\n⚡ Generating... / 生成中...\n");
            
            try {
                const advice = await coach.getAdvice(trimmedInput);
                console.log("📱 Reply / 回复:");
                console.log("-".repeat(60));
                console.log(advice);
                console.log("-".repeat(60));
                console.log();
            } catch (error) {
                console.error("\n😭 Error! / 出错了！\n");
            }
            
            askQuestion();
        });
    };
    
    askQuestion();
}

main(); 