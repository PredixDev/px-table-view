#!/bin/bash -e
# This script pushes a demo-friendly version of your element and its
# dependencies to gh-pages.

# usage gp Polymer core-item [branch]
# Run in a clean directory passing in a GitHub org and repo name

set -e            # Exit the shell when a simple command exits with nonzero status.
set -o pipefail   # The return value of a pipeline is the value of the last (rightmost) command to exit with a nonzero status,
set -x            # Print commands (after expansions) before running them.


status() {
  echo "-----> $*"
}

# Exit with nonzero exit code if anything fails
set -e


#set our source and traget branches
SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
REPO=`git config remote.origin.url`

#pull requests and commits to other branches shouldn't try to deploy
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    status "Skipping deploy; just doing a build."
    #exit 0
fi

#create a temp directory that will store the bower.json file
mkdir tmp_bower

#clone this repo, and go into that folder.
git clone ${REPO} ghp_tmp
cd ghp_tmp

#find out our repo name from the bower file
REPO_NAME=$(grep "name" bower.json | sed 's/"name": "//' | sed 's/",//')
status "repo name is ${REPO_NAME}"

#set up our variables and configs
git config user.name "Travis CI"
git config user.email "PredixtravisCI@ge.com"

SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}

#copy the bower.json file out of the directory to a temp one
cp bower.json ../tmp_bower/bower.json
#and checkout gh-pages - create it if it doesn't exist.
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
#copy the bower.json file from our temp directory into the current one, overriding it, and passing a yes in there's a prompt
yes | cp ../tmp_bower/bower.json bower.json

#install your new tag through bower, it will fail without forcing it.
bower install ${REPO_NAME} --force

#do the git stuff
git add .
git commit -m "rebuild github pages"
eval `ssh-agent -s`
#and cahnge permissions
chmod 0400 $TRAVIS_BUILD_DIR/deploy_key
ssh-add $TRAVIS_BUILD_DIR/deploy_key
#Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH
