/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { NagRuleCompliance } from 'cdk-nag';
import { CfnRule } from 'aws-cdk-lib/aws-events';

/**
 * Ensure that API Gateway REST and HTTP APIs are using JSON structured logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
    (node: CfnResource): NagRuleCompliance => {
        if (node instanceof CfnRule) {
            const targets: CfnRule.TargetProperty[] = Stack.of(node).resolve(node.targets);
            if (targets.every((target) => target.deadLetterConfig)) return NagRuleCompliance.COMPLIANT;
            return NagRuleCompliance.NON_COMPLIANT;
        }
        return NagRuleCompliance.NOT_APPLICABLE;
    },
    'name', { value: parse(__filename).name }
);