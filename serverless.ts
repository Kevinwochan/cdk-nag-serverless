import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
    NagMessageLevel,
    NagPack,
    NagPackProps,
    rules,
} from 'cdk-nag';
import { lambda } from './rules';

/**
 * Serverless Checks are a compilation of rules to validate infrastructure-as-code template against recommended practices.
 *
 */
export class ServerlessChecks extends NagPack {
    constructor(props?: NagPackProps) {
        super(props);
        this.packName = 'Serverless';
    }
    public visit(node: IConstruct): void {
        if (node instanceof CfnResource) {
            this.checkLambda(node);
            this.checkCloudwatch(node);
            this.checkApiGw(node);
        }
    }

    /**
     * Check Lambda Resources
     * @param node the CfnResource to check
     * @param ignores list of ignores for the resource
     */
    private checkLambda(node: CfnResource) {
        this.applyRule({
            info: 'Ensure that Lambda functions have an explcity timeout value',
            explanation: "Lambda functions have a default timeout of 3 seconds.  If your timeout value is too short, Lambda might terminate invocations prematurely. On the other side, setting the timeout much higher than the average execution may cause functions to execute for longer upon code malfunction, resulting in higher costs and possibly reaching concurrency limits depending on how such functions are invoked. You can also use AWS Lambda Power Tuning to test your function at different timeout settings to find the one that matches your cost and performance requirements the best.",
            level: NagMessageLevel.ERROR,
            rule: lambda.LambdaDefaultTimeout,
            node: node,
        });
        this.applyRule({
            info: 'Ensure that Lambda functions have an explicit memory value',
            explanation: "Lambda allocates CPU power in proportion to the amount of memory configured. By default, your functions have 128 MB of memory allocated. You can increase that value up to 10 GB. With more CPU resources, your Lambda function's duration might decrease.  You can use tools such as AWS Lambda Power Tuning to test your function at different memory settings to find the one that matches your cost and performance requirements the best.",
            level: NagMessageLevel.ERROR,
            rule: lambda.LambdaDefaultMemorySize,
            node: node,
        });
        this.applyRule({
            info: 'Ensure Lambda event source mappings have a destination configured',
            explanation: 'When an AWS Lambda invocation fails to process an event from your source mapping, a onFailure destination configuration defines where the event will be temporarily stored, usually a SQS DLQ',
            level: NagMessageLevel.ERROR,
            rule: lambda.LambdaESMDestination,
            node: node,
        })
        this.applyRule({
            info: 'The Lambda function should have tracing set to Tracing.ACTIVE',
            explanation:
                "When a Lambda function has ACTIVE tracing, Lambda automatically samples invocation requests, based on the sampling algorithm specified by X-Ray.",
            level: NagMessageLevel.ERROR,
            rule: lambda.LambdaTracing,
            node: node,
        });

        this.applyRule({
            info: 'Ensure that Lambda functions have a corresponding Log Group',
            explanation: "Lambda captures logs for all requests handled by your function and sends them to Amazon CloudWatch Logs.  You can insert logging statements into your code to help you validate that your code is working as expected. Lambda sends all logs from your code to the CloudWatch logs group associated with a Lambda function.",
            level: NagMessageLevel.ERROR,
            rule: lambda.LambdaLogging,
            node: node
        });
    }

    /**
     * Check Cloudwatch Resources
     * @param node the CfnResource to check
     * @param ignores list of ignores for the resource
     */
    private checkCloudwatch(node: CfnResource) {
        this.applyRule({
            info: 'Ensure that CloudWatch Log Groups have an explcity retention policy',
            explanation: "By default, logs are kept indefinitely and never expire. You can adjust the retention policy for each log group, keeping the indefinite retention, or choosing a retention period between 10 years and one day.",
            level: NagMessageLevel.ERROR,
            rule: rules.cloudwatch.CloudWatchLogGroupRetentionPeriod,
            node: node,
        });
    }

    /**
     * Check API Gateway Resources
     * @param node the CfnResource to check
     * @param ignores list of ignores for the resource
     */
    private checkApiGw(node: CfnResource) {
        this.applyRule({
            info: 'Ensure tracing is enabled',
            explanation: "Amazon API Gateway provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.",
            level: NagMessageLevel.ERROR,
            rule: rules.apigw.APIGWXrayEnabled,
            node: node,
        });
    }
}