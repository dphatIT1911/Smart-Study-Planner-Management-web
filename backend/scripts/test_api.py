import google.generativeai as genai
import openai

# Test Gemini
try:
    genai.configure(api_key='AIzaSyB4QxSVEd17zILdbHcv4xZ1oFfj4k5r2To')
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content('Xin chao')
    print('Gemini OK:', response.text[:80])
except Exception as e:
    print('Gemini FAILED:', str(e))

# Test OpenAI
try:
    client = openai.OpenAI(api_key='sk-proj-i1ub0ZmUD5wt7G9rmLPteaargf3vGjdGHR7llqQFVR47Rq3jTbJsVI0oj7q7ehIPR817pwIxQoT3BlbkFjxb8t-aXzXketjL0ipuWAXyIVBZabUYzl9Vz4alWPKCBfDUkCAsGEsg0QgUqcfS2I-cI689UAkA')
    resp = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[{'role': 'user', 'content': 'Hi'}],
        max_tokens=10
    )
    print('OpenAI OK:', resp.choices[0].message.content)
except Exception as e:
    print('OpenAI FAILED:', str(e))
