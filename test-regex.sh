#!/bin/bash

# Simple test to verify the regex works
node -e "
const testUrl = 'file:///test/image.jpeg';
const regex = /^(https?|file):\/\/\/?.*$/;
console.log('Testing URL:', testUrl);
console.log('Regex match:', regex.test(testUrl));
console.log('');

const testUrl2 = 'https://example.com/image.jpg';
console.log('Testing URL:', testUrl2);
console.log('Regex match:', regex.test(testUrl2));
"
