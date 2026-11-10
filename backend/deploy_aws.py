"""
PAANIPULSE - Automated AWS Cloud Deployment Script
Deploys DynamoDB, AWS Lambda (Python 3.12), and Amazon API Gateway HTTP API.
Zero manual AWS Console clicking required.
"""
import os
import sys
import time
import json
import zipfile
import io

def print_header(title: str):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)

def main():
    print_header("PAANIPULSE AWS SERVERLESS CLOUD DEPLOYMENT")

    # Step 1: Verify boto3
    try:
        import boto3
        from botocore.exceptions import NoCredentialsError, ClientError
    except ImportError:
        print("❌ 'boto3' is not installed in the Python environment.")
        print("👉 Run: pip install boto3")
        sys.exit(1)

    region = os.environ.get("AWS_DEFAULT_REGION") or os.environ.get("AWS_REGION") or "ap-south-1"

    # Step 2: Check AWS Authentication
    print(f"🔍 Checking AWS Identity in Region: {region}...")
    try:
        sts = boto3.client("sts", region_name=region)
        identity = sts.get_caller_identity()
        account_id = identity["Account"]
        arn = identity["Arn"]
        print(f"✅ Authenticated to AWS Account: {account_id}")
        print(f"👤 Caller ARN: {arn}")
    except NoCredentialsError:
        print("\n❌ AWS Credentials Not Found!")
        print("-" * 65)
        print("To deploy directly to your AWS Account, please set your credentials:")
        print("Option A (Windows PowerShell):")
        print('  $env:AWS_ACCESS_KEY_ID="your_access_key"')
        print('  $env:AWS_SECRET_ACCESS_KEY="your_secret_key"')
        print('  $env:AWS_DEFAULT_REGION="ap-south-1"')
        print("Option B (AWS CLI):")
        print("  aws configure")
        print("-" * 65)
        print("💡 The application is completely functional locally with hot-reloading.")
        return False
    except Exception as e:
        print(f"\n❌ AWS Authentication Error: {e}")
        return False

    # Step 3: Cost and Free Tier Notice
    print("\n💰 Cost Assessment:")
    print("  • DynamoDB: On-Demand (PAY_PER_REQUEST) — $0 within Free Tier (25 GB free)")
    print("  • AWS Lambda: 1 Million free requests/month under Free Tier")
    print("  • API Gateway: 1 Million free API calls/month under Free Tier")
    print("  • Estimated Monthly Cost: $0.00 for hackathon evaluation")

    dynamodb = boto3.client("dynamodb", region_name=region)
    iam = boto3.client("iam", region_name=region)
    lambda_client = boto3.client("lambda", region_name=region)
    apigateway = boto3.client("apigatewayv2", region_name=region)

    table_name = "PaanipulseReports"

    # Step 4: DynamoDB Provisioning
    print_header(f"1. Provisioning DynamoDB Table: {table_name}")
    try:
        tables = dynamodb.list_tables()["TableNames"]
        if table_name in tables:
            print(f"✅ DynamoDB Table '{table_name}' already exists.")
        else:
            print(f"Creating DynamoDB table '{table_name}'...")
            dynamodb.create_table(
                TableName=table_name,
                BillingMode="PAY_PER_REQUEST",
                AttributeDefinitions=[
                    {"AttributeName": "localityId", "AttributeType": "S"},
                    {"AttributeName": "timestamp#reportId", "AttributeType": "S"}
                ],
                KeySchema=[
                    {"AttributeName": "localityId", "KeyType": "HASH"},
                    {"AttributeName": "timestamp#reportId", "KeyType": "RANGE"}
                ],
                Tags=[
                    {"Key": "Project", "Value": "PaaniPulse"},
                    {"Key": "Hackathon", "Value": "Techfest-2026-AWS"}
                ]
            )
            print("⏳ Waiting for table to become ACTIVE...")
            waiter = dynamodb.get_waiter("table_exists")
            waiter.wait(TableName=table_name)
            print(f"✅ DynamoDB Table '{table_name}' is ACTIVE.")
    except Exception as e:
        print(f"⚠️ DynamoDB Warning: {e}")

    # Step 5: IAM Role for Lambda
    print_header("2. IAM Role for Lambda Serverless Execution")
    role_name = "PaanipulseLambdaExecutionRole"
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }

    try:
        role_arn = iam.get_role(RoleName=role_name)["Role"]["Arn"]
        print(f"✅ IAM Role '{role_name}' already exists: {role_arn}")
    except iam.exceptions.NoSuchEntityException:
        print(f"Creating IAM role '{role_name}'...")
        role_res = iam.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description="Least-privilege role for PAANIPULSE Water Intelligence API"
        )
        role_arn = role_res["Role"]["Arn"]
        print("Attaching CloudWatch & DynamoDB policies...")
        iam.attach_role_policy(
            RoleName=role_name,
            PolicyArn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        )
        # Inline policy for DynamoDB table access
        dynamo_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "dynamodb:PutItem",
                        "dynamodb:GetItem",
                        "dynamodb:Query",
                        "dynamodb:Scan",
                        "dynamodb:UpdateItem"
                    ],
                    "Resource": f"arn:aws:dynamodb:{region}:{account_id}:table/{table_name}"
                }
            ]
        }
        iam.put_role_policy(
            RoleName=role_name,
            PolicyName="PaanipulseDynamoAccess",
            PolicyDocument=json.dumps(dynamo_policy)
        )
        print("⏳ Waiting 10s for IAM propagation...")
        time.sleep(10)
        print(f"✅ IAM Role ready: {role_arn}")

    # Step 6: Package Lambda Artifact
    print_header("3. Packaging Lambda Code Artifact")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as z:
        for py_file in ["lambda_function.py", "models.py", "algorithms.py", "database.py"]:
            file_path = os.path.join(current_dir, py_file)
            if os.path.exists(file_path):
                z.write(file_path, arcname=py_file)
                print(f"  Added {py_file} to deployment package.")
    zip_buffer.seek(0)
    zip_bytes = zip_buffer.read()
    print(f"✅ Packaged zip archive ({len(zip_bytes)} bytes).")

    # Step 7: Deploy Lambda Function
    function_name = "PaanipulseCoreApi"
    print_header(f"4. Deploying Lambda Function: {function_name}")
    try:
        lambda_client.get_function(FunctionName=function_name)
        print(f"Updating code for existing function '{function_name}'...")
        lambda_res = lambda_client.update_function_code(
            FunctionName=function_name,
            ZipFile=zip_bytes
        )
        function_arn = lambda_res["FunctionArn"]
        print(f"✅ Lambda function updated: {function_arn}")
    except lambda_client.exceptions.ResourceNotFoundException:
        print(f"Creating Lambda function '{function_name}' (Python 3.12)...")
        lambda_res = lambda_client.create_function(
            FunctionName=function_name,
            Runtime="python3.12",
            Role=role_arn,
            Handler="lambda_function.lambda_handler",
            Code={"ZipFile": zip_bytes},
            Description="PAANIPULSE Water Intelligence Backend Engine",
            Timeout=15,
            MemorySize=256,
            Environment={
                "Variables": {
                    "DYNAMODB_TABLE": table_name,
                    "AWS_REGION_DEPLOYED": region
                }
            }
        )
        function_arn = lambda_res["FunctionArn"]
        print(f"✅ Lambda function created: {function_arn}")

    # Step 8: Amazon API Gateway HTTP API
    print_header("5. Configuring Amazon API Gateway HTTP API")
    api_name = "PaanipulseHttpApi"
    api_id = None
    existing_apis = apigateway.get_apis()["Items"]
    for a in existing_apis:
        if a["Name"] == api_name:
            api_id = a["ApiId"]
            print(f"✅ API Gateway '{api_name}' already exists (ID: {api_id})")
            break

    if not api_id:
        print(f"Creating HTTP API Gateway '{api_name}' with CORS...")
        api_res = apigateway.create_api(
            Name=api_name,
            ProtocolType="HTTP",
            CorsConfiguration={
                "AllowOrigins": ["*"],
                "AllowMethods": ["GET", "POST", "OPTIONS"],
                "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With", "X-Reporter-Token"],
                "MaxAge": 600
            }
        )
        api_id = api_res["ApiId"]
        print(f"✅ API Gateway Created: {api_id}")

    # Create Lambda Proxy Integration
    integrations = apigateway.get_integrations(ApiId=api_id)["Items"]
    integration_id = None
    for integ in integrations:
        if integ.get("IntegrationType") == "AWS_PROXY":
            integration_id = integ["IntegrationId"]
            break

    if not integration_id:
        print("Configuring Lambda proxy integration...")
        integ_res = apigateway.create_integration(
            ApiId=api_id,
            IntegrationType="AWS_PROXY",
            IntegrationUri=function_arn,
            PayloadFormatVersion="2.0"
        )
        integration_id = integ_res["IntegrationId"]

    # Create Default Catch-all Route: $default
    routes = apigateway.get_routes(ApiId=api_id)["Items"]
    default_route_exists = any(r.get("RouteKey") == "$default" for r in routes)
    if not default_route_exists:
        print("Creating $default route routing all traffic to Lambda...")
        apigateway.create_route(
            ApiId=api_id,
            RouteKey="$default",
            Target=f"integrations/{integration_id}"
        )

    # Grant API Gateway permission to invoke Lambda
    try:
        lambda_client.add_permission(
            FunctionName=function_name,
            StatementId=f"apigateway-invoke-{api_id}",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=f"arn:aws:execute-api:{region}:{account_id}:{api_id}/*"
        )
        print("✅ Added API Gateway invocation permission to Lambda.")
    except Exception:
        pass # Permission already exists

    # Public API Gateway URL
    api_endpoint = f"https://{api_id}.execute-api.{region}.amazonaws.com"
    print_header("🎉 AWS BACKEND DEPLOYMENT COMPLETE!")
    print(f"🌐 Live API Gateway Endpoint: {api_endpoint}")
    print(f"👉 Health Endpoint: {api_endpoint}/health")
    print(f"👉 Summary Endpoint: {api_endpoint}/summary?localityId=mumbai-bandra-west")
    print(f"👉 Localities Endpoint: {api_endpoint}/localities")

    # Update frontend config with the live AWS URL
    config_path = os.path.join(current_dir, "..", "frontend", "src", "config.ts")
    config_content = f"""// Auto-generated PAANIPULSE AWS Configuration
export const API_BASE_URL = "{api_endpoint}";
export const IS_AWS_DEPLOYED = true;
"""
    with open(config_path, "w", encoding="utf-8") as f:
        f.write(config_content)
    print(f"✅ Updated frontend configuration with live AWS endpoint.")

    # Save to Live Demo deliverable
    live_url_file = os.path.join(current_dir, "..", "PAANIPULSE_Techfest_2026_27_Submission", "03_Live_Demo", "LIVE_APPLICATION_URL.txt")
    os.makedirs(os.path.dirname(live_url_file), exist_ok=True)
    with open(live_url_file, "w", encoding="utf-8") as f:
        f.write(f"PAANIPULSE Live AWS API Gateway Endpoint:\n{api_endpoint}\n\nAWS Region: {region}\nDynamoDB Table: {table_name}\nLambda Function: {function_name}\n")

    return True

if __name__ == "__main__":
    main()
