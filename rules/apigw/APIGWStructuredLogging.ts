/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { NagRuleCompliance } from 'cdk-nag';
import { CfnApi } from 'aws-cdk-lib/aws-sam';

/**
 * Ensure that API Gateway REST and HTTP APIs are using JSON structured logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
    (node: CfnResource): NagRuleCompliance => {
        if (node instanceof CfnApi) {
            const accessLogSetting = Stack.of(node).resolve(node.accessLogSetting);
            if (!node.accessLogSetting) return NagRuleCompliance.NOT_APPLICABLE;
            try {
                const format = JSON.parse(accessLogSetting.format)
                return NagRuleCompliance.COMPLIANT;
            } catch (e) {
                return NagRuleCompliance.NON_COMPLIANT;
            }
        }
        return NagRuleCompliance.NOT_APPLICABLE;
    },
    'name', { value: parse(__filename).name }
);