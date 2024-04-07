/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventSourceMapping, CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from 'cdk-nag';

/**
 * Ensure Lambda event source mappings have a destination configured
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
    (node: CfnResource): NagRuleCompliance => {
        if (node instanceof CfnEventSourceMapping) {
            const destinationConfig = Stack.of(node).resolve(node.destinationConfig);
            if (destinationConfig?.onFailure) return NagRuleCompliance.COMPLIANT;
            return NagRuleCompliance.NON_COMPLIANT;
        }
        return NagRuleCompliance.NOT_APPLICABLE;
    },
    'name', { value: parse(__filename).name }
);