import os
import re
import csv
import ollama
from dotenv import load_dotenv
from pydantic import BaseModel
from apify_client import ApifyClient
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

MODEL = "llama2:7b"
APIFY_API_KEY = os.getenv("APIFY_API_KEY")
os.makedirs("data", exist_ok=True)


app = FastAPI()
origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND")
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

apify_client = ApifyClient(APIFY_API_KEY)


class ConfessionRequest(BaseModel):
    link: str
    num: int = 10


class SummarizeRequest(BaseModel):
    link: str

class OverviewRequest(BaseModel):
    page: str


class Post():
    def __init__(self, text, url, likes=0, comments=0, shares=0, time=None):
        self.url = url
        self.time = time
        self.text = text
        self.likes = likes
        self.shares = shares
        self.comments = comments
        self.summary = summarize(text)
        self.textLimit = text if len(text) < 100 else text[:100] + "..."

post_pattern = re.compile(r"#[-\w.,:;!?(){}\[\]\"'_+/\\|*]+")
facebook_pattern = re.compile(r"^https://www\.facebook\.com/([^/?#]+)$")


system_prompt = """
Bạn là một quản trị viên trường học. Dưới đây là một bình luận có thể liên quan đến trường của bạn.
Hãy tóm tắt nội dung bình luận, đánh giá mức độ tích cực / tiêu cực / trung lập, và đề xuất giải pháp.
Trả lời bằng tiếng Việt.
"""


def user_prompt_for(content):
    return f"""
    Bạn chỉ có thông tin sau, không hỏi thêm.
    Nội dung bài đăng trên Facebook: {content}.
    Nội dung theo dạng như sau:
    Nội dung: (Bài viết đã tóm tắt)
    Giải pháp: (Giải pháp nếu cần)
    Loại: chỉ cần ghi ("Tích cực", "Tiêu cực", "Trung lập") và có màu chữ
    """


def summarize(content):
    try:
        response = ollama.chat(model=MODEL, messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt_for(content)},
        ])  
        return response['message']['content']
    except Exception as e:
        return f"Lỗi: {e}"


@app.get("/")
def get_hello():
    return {"message": "hello, we are we"}


@app.post("/get-posts")
async def get_posts(request: ConfessionRequest):
    link = request.link

    if not facebook_pattern.match(link):
        raise HTTPException(status_code=400, detail="Invalid link! Only Facebook links are allowed.")

    page = ""
    match = re.search(r"facebook\.com/([^/?#]+)", link)
    if match:
        page = match.group(1)  # Extract the matched endpoint
    else:
        raise HTTPException(status_code=400, detail="Invalid Facebook link format")

    run_input = {
        "startUrls": [{"url": link}],
        "resultsLimit": request.num
    }

    run = apify_client.actor("KoJrdxJCTtpon81KY").call(run_input=run_input)

    post_count = 0
    with open(f"data/{page}.csv", mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Text", "URL", "Likes", "Comments", "Shares", "Time"])  # Write CSV header
        for item in apify_client.dataset(run["defaultDatasetId"]).iterate_items():
            post_text = item.get("text", "No text")
            if post_pattern.match(post_text):
                writer.writerow([
                    post_text, 
                    item.get("url"),
                    item.get("likes", 0),
                    item.get("comments", 0),
                    item.get("shares", 0),
                    item.get("time", None)
                ])
                post_count += 1

    return {"message": "Get new posts completed!", "total_posts": post_count, "page": page}


@app.post("/get-summarize")
async def get_summaries(request: SummarizeRequest):
    link = request.link
    page = ""
    match = re.search(r"facebook\.com/([^/?#]+)", link)
    if match:
        page = match.group(1)
    else:
        raise HTTPException(status_code=400, detail="Invalid Facebook link format!")

    if not os.path.exists(f"data/{page}.csv"):
        raise HTTPException(status_code=404, detail="Invalid page!")

    posts = []
    with open(f"data/{page}.csv", mode="r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header
        for row in reader:
            text = row[0]
            url = row[1]
            likes = int(row[2]) if row[2].isdigit() else 0  # Ensure likes is an integer
            comments = int(row[3]) if row[3].isdigit() else 0  # Ensure comments is an integer
            shares = int(row[4]) if row[4].isdigit() else 0  # Ensure shares is an integer
            time = row[5]
            posts.append(Post(text, url, likes, comments, shares, time))

    return posts


@app.post("/get-overview")
async def get_overview(request: OverviewRequest):
    page = request.page

    content = ""
    with open(f"data/{page}.csv", mode="r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)
        for row in reader:
            content += f"r{row[0]}\n"
    
    system_prompt = """
    Bạn là một quản trị viên trường học. Dưới đây là những bình luận có thể liên quan đến trường của bạn.
    Hãy xem xét chúng và đưa ra xem dạo gần đây tình hình trường học của bạn đang như thế nào.
    Trả lời bằng tiếng Việt.
    """
    try:
        response = ollama.chat(model=MODEL, messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content},
        ])  
        return {"response": response['message']['content']}
    except Exception as e:
        return f"Lỗi: {e}"
        

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
