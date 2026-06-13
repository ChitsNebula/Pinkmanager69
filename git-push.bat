@echo off
d:
cd \pink69
echo [1/3] Adding files to git...
git add .
echo [2/3] Committing changes...
git commit -m "feat: support unlimited special duty capacity and update UI layout"
echo [3/3] Pushing to GitHub...
git push
echo Complete!
pause
