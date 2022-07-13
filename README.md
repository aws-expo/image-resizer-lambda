# image-resizer-lambda

# Resources

- documentation for the CLI: https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-code.html
- documentation how to work with Lambda and NodeJS: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html

## The whole flow

1. `npm install`
2. `zip -r code.zip .`
3. `aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://./code.zip`
