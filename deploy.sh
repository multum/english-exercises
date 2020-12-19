set -e

npm run build

cd build

git init
git add -A
git commit -m 'Deploy'

git push -f https://github.com/multum/english-exercises.git master:gh-pages

cd -
