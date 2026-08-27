using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Amanote.Api.Services
{
    public interface IGeminiService
    {
        Task<string> SummarizeAsync(string text);
        Task<string> ChatAsync(string question, string context);
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["Gemini:ApiKey"]!;
        }

        public async Task<string> SummarizeAsync(string text)
        {
            var prompt = $"Summarize the following notes in a clear and concise way. Use bullet points if helpful:\n\n{text}";

            return await CallGeminiAsync(prompt);
        }

        public async Task<string> ChatAsync(string question, string context)
        {
            var prompt = $"You are an AI study assistant. Based on the following document notes, answer the user's question.\n\nNotes:\n{context}\n\nQuestion: {question}";

            return await CallGeminiAsync(prompt);
        }

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return $"Error: {response.StatusCode} - {responseString}";
            }

            using var doc = JsonDocument.Parse(responseString);
            var root = doc.RootElement;

            try
            {
                var candidates = root.GetProperty("candidates");
                var firstCandidate = candidates[0];
                var parts = firstCandidate.GetProperty("content").GetProperty("parts");
                var text = parts[0].GetProperty("text").GetString();
                return text ?? "No response generated.";
            }
            catch (Exception ex)
            {
                return $"Error parsing response: {ex.Message}";
            }
        }
    }
}
