// require("dotenv").config();
// const { Configuration, OpenAIApi } = require("openai"); // Correct import

// // Configure OpenAI with the API key
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY, // Ensure this key exists in your .env file
// });

// const openai = new OpenAIApi(configuration);

// // Define the chatbot response controller
// const getChatBotResponse = async (req, res) => {
//   const { message, userId } = req.body;

//   // Validate input
//   if (!message || !userId) {
//     return res.status(400).json({ status: false, message: "Message or User ID is missing" });
//   }

//   try {
//     // Generate response from OpenAI
//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: message }],
//     });

//     const aiReply = response.data.choices[0].message.content;

//     // Send the response back to the client
//     res.status(200).json({ status: true, reply: aiReply });
//   } catch (error) {
//     console.error("Error getting response from OpenAI:", error.message);
//     res.status(500).json({ status: false, message: "Failed to get response from OpenAI" });
//   }
// };

// module.exports = { getChatBotResponse };



const OpenAI = require("openai")
// const openai = new OpenAI();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load API key from environment variables
  });

const getChatBotResponse = async (req,res)=>{
    const { message } = req.body;
    console.log("message",message)

    if (!message ) {
      return res.status(400).json({ status: false, message: "Message or User ID is missing" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });

    const aiReply = await completion.choices[0].message.content;
    res.status(200).json({ status: true, reply: aiReply });
 
}

module.exports = {getChatBotResponse}