HUONG DAN SU DUNG

1. Mo folder nay bang VS Code.
2. Bam dup vao file index.html de mo tren trinh duyet.
   Hoac trong VS Code cai extension "Live Server" roi bam Go Live.
3. Muon sua noi dung, mo file script.js va sua object siteData o tren cung.
4. Muon doi giao dien, mo file style.css.

THEM ANH VA NHAC CUA BAN

Project da tao san folder de ban chi viec copy file vao:
- assets/images/
- assets/music/

Chi can dat dung ten file nhu sau:

Anh:
- assets/images/cover.jpg
- assets/images/photo-1.jpg
- assets/images/photo-2.jpg
- assets/images/photo-3.jpg
- assets/images/photo-4.jpg

Nhac:
- assets/music/birthday-song.mp3

CACH LAM NHANH NHAT

B1. Chon 1 anh dep nhat lam anh bia, doi ten thanh cover.jpg
B2. Chon 4 anh cua hai ban, doi ten thanh photo-1.jpg den photo-4.jpg
B3. Chon 1 bai nhac MP3, doi ten thanh birthday-song.mp3
B4. Copy cac file do vao dung folder assets/images va assets/music
B5. Reload lai file index.html la web tu cap nhat

NEU ANH KHONG LEN
- Kiem tra dung ten file chua
- Kiem tra duoi file co phai .jpg va .mp3 khong
- Thu bam Ctrl + F5 de reload manh

NEU BAN MUON DUNG TEN FILE KHAC
- Mo script.js
- Sua cac dong:
  coverImage: "assets/images/cover.jpg"
  musicUrl: "assets/music/birthday-song.mp3"
  image: "assets/images/photo-1.jpg"
  ...

DAY LEN GITHUB

Cach don gian nhat:
- Tao repo moi tren GitHub.
- Upload tat ca file va folder trong project nay len, bao gom ca folder assets.

NEU DUNG GIT:

git init
git add .
git commit -m "birthday website"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

NEU MUON CHAY GITHUB PAGES
- Vao repo tren GitHub
- Settings -> Pages
- Source: Deploy from a branch
- Branch: main / root
- Save
- Cho 1 luc se co link web
