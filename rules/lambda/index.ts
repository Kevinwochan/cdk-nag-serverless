/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
export { default as LambdaLogging } from './LambdaLogging'
export { default as LambdaTracing } from './LambdaTracing'
export { default as LambdaESMDestination } from './LambdaESMDestination'
export { default as LambdaDefaultMemorySize } from './LambdaDefaultMemorySize'

/*
"""
Rules for Lambda resources
"""
class LambdaDefaultMemorySizeRule(CloudFormationLintRule):
    """
    Ensure that Lambda functions have an explicit memory value
    """

    id = "ES1005"  # noqa: VNE003
    shortdesc = "Lambda Default Memory Size"
    description = "Ensure that Lambda functions have an explicit memory value"
    source_url = "https://awslabs.github.io/serverless-rules/rules/lambda/default_memory_size/"
    tags = ["lambda"]

    _message = "Lambda function {} does not have a MemorySize property"

    def match(self, cfn):
        """
        Match against Lambda functions without an explicity MemorySize
        """

        matches = []

        for key, value in cfn.get_resources(["AWS::Lambda::Function"]).items():
            memory_size = value.get("Properties", {}).get("MemorySize", None)

            if memory_size is None:
                matches.append(RuleMatch(["Resources", key], self._message.format(key)))

        return matches


class LambdaDefaultTimeoutRule(CloudFormationLintRule):
    """
    Ensure that Lambda functions have an explicit timeout value
    """

    id = "ES1006"  # noqa: VNE003
    shortdesc = "Lambda Default Timeout"
    description = "Ensure that Lambda functions have an explicit timeout value"
    source_url = "https://awslabs.github.io/serverless-rules/rules/lambda/default_timeout/"
    tags = ["lambda"]

    _message = "Lambda function {} does not have a Timeout property"

    def match(self, cfn):
        """
        Match against Lambda functions without an explicity Timeout
        """

        matches = []

        for key, value in cfn.get_resources(["AWS::Lambda::Function"]).items():
            timeout = value.get("Properties", {}).get("Timeout", None)

            if timeout is None:
                matches.append(RuleMatch(["Resources", key], self._message.format(key)))

        return matches


class LambdaAsyncNoDestinationRule(CloudFormationLintRule):
    """
    Ensure that Lambda functions invoked asynchronously have a destination configured
    """

    id = "ES1007"  # noqa: VNE003
    shortdesc = "Lambda Async Destination"
    description = "Ensure that Lambda functions invoked asynchronously have a destination configured"
    source_url = "https://awslabs.github.io/serverless-rules/rules/lambda/async_failure_destination/"
    tags = ["lambda"]

    _message = "Lambda permission {} has an asynchronous permission but doesn't have an EventInvokeConfig resource related to it"  # noqa: E501

    _async_principals = [
        "events.amazonaws.com",
        "events.amazonaws.com.cn",
        "iot.amazonaws.com",
        "iot.amazonaws.com.cn",
        "s3.amazonaws.com",
        "s3.amazonaws.com.cn",
        "sns.amazonaws.com",
        "sns.amazonaws.com.cn",
    ]

    def _get_async_functions(self, permissions: Dict[str, dict]) -> Dict[str, Union[dict, str]]:
        """
        Return a list of FunctionName properties for permissions with principals that invoke Lambda
        functions asynchronously
        """

        async_functions = {}

        for key, value in permissions.items():
            function_name = value.get("Properties", {}).get("FunctionName", "")
            principal = value.get("Properties", {}).get("Principal", "")

            # No FunctionName, we cannot evaluate this rule
            if not function_name:
                continue

            if principal in self._async_principals:
                async_functions[key] = function_name

        return async_functions

    def match(self, cfn):
        """
        Match against Lambda functions without an explicity Timeout
        """

        matches = []

        permissions = cfn.get_resources(["AWS::Lambda::Permission"])
        event_invoke_configs = cfn.get_resources(["AWS::Lambda::EventInvokeConfig"])

        async_functions = self._get_async_functions(permissions)

        found = []

        for value in event_invoke_configs.values():
            function_name = value.get("Properties", {}).get("FunctionName", "")
            on_failure_destination = (
                value.get("Properties", {}).get("DestinationConfig", {}).get("OnFailure", {}).get("Destination", None)
            )

            if function_name in async_functions.values() and on_failure_destination is not None:
                found.append(function_name)

        for key, value in async_functions.items():
            if value not in found:
                matches.append(RuleMatch(["Resources", key], self._message.format(key)))

        return matches
*/