import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
    NagMessageLevel,
    NagPack,
    NagPackProps,
    NagRuleCompliance,
    NagRuleResult,
    NagRules,
    rules,
} from 'cdk-nag';

export class ExampleChecks extends NagPack {
    constructor(props?: NagPackProps) {
        super(props);
        this.packName = 'Example';
    }
    public visit(node: IConstruct): void {
        if (node instanceof CfnResource) {
            // Add your rules here.
            this.applyRule({
                info: 'My brief info.',
                explanation: 'My detailed explanation.',
                level: NagMessageLevel.ERROR,
                rule: rules.s3.S3BucketSSLRequestsOnly,
                node: node,
            });
        }
    }
}