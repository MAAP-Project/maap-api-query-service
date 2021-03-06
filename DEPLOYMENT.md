# MAAP API Query Service Deployment

Deploys the database and API query service for GEDI Cal/Val data.

## Prerequisities

- Create an RDS database for the GEDI Cal/Val data in the AWS account

## Steps

1. Clone the repo
2. Install `aws sam cli`:

    ``` bash
    brew tap aws/tap
    brew install aws-sam-cli
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Create SSM parameters for the information used to access the GEDI database: `host`, `name`, `username`, and `password`. Consult the [README for guidance on how to create SSM parameters](https://github.com/MAAP-Project/maap-api-query-service#ssm). By default, the following names are assumed for the parameters in the deployment code, but any names can be used for the parameters:

    - host: `/dev/gedi-cal-val-db/host`
    - name: `/dev/gedi-cal-val-db/name`
    - username: `/dev/gedi-cal-val-db/user`
    - password: `/dev/gedi-cal-val-db/pass`

5. If your RDS database for GEDI Cal/Val data is deployed in a VPC, you need to create a security group to allow access from your API query service Lambdas to the database. If your RDS database is not in a VPC, you can skip this step.

    First, create the new security group and add a rule to allow all outbound traffic:

    | Type | Protocol | Port Range | Destination |
    |-|-|-|-|
    | All traffic | All | All | 0.0.0.0/0 |

    Then, edit the security group to add an inbound rule allowing traffic on port 5432 from the security group itself (where `sg-1234` is the name of the security group that you created):

    | Type | Protocol | Port Range | Source |
    |-|-|-|-|
    | PostgreSQL | TCP | 5432 | sg-1234 |

6. Set the environment variables:

    - `STAGE`: name of deployment stage (e.g. `dev`, `uat`, `ops`) (default: `dev`)
    - `NODE_ENV` (default: `production`)
    - `SSM_GEDI_DB_HOST`: name of SSM parameter for GEDI database host (default: `/dev/gedi-cal-val-db/host`)
    - `SSM_GEDI_DB_NAME`: name of SSM parameter for GEDI database name (default: `/dev/gedi-cal-val-db/name`)
    - `SSM_GEDI_DB_USER`: name of SSM parameter for GEDI database username created in step 4 (default: `/dev/gedi-cal-val-db/user`)
    - `SSM_GEDI_DB_PASS`: name of SSM parameter for GEDI database password created in step 4 (default: `/dev/gedi-cal-val-db/pass`)
    - `PERMISSIONS_BOUNDARY_ARN` (optional): ARN of IAM permissions boundary policy to use when creating IAM roles
    - `VPC_ID` (optional): VPC ID, if necesary (e.g. `vpc-123`)
    - `VPC_SUBNET_IDS` (optional): comma-delimited list of VPC subnet IDs, if necesary (e.g. `subnet-123,subnet-456`)
    - `SECURITY_GROUP_ID` (optional): ID of security group created in step 5, if any (e.g. `sg-123`)

7. Run full deployment (builds, packages and deploys):

    ```bash
    npm run full-deploy
    ```

## Testing the deployment

1. Copy the `QueryStateMachineArn` output from the above step. Looks like

    ```text
    Outputs
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Key                 QueryStateMachineArn
    Description         Query State Machine ARN
    Value               arn:aws:states:us-west-2:XXXXXXXXXXXX:stateMachine:maap-api-query-service-uat-RunQuery
    ```

2. Run:

  ```bash
    npm run test-deployment <QueryStateMachineArn>
  ```

### Note on testing

The test script `/scripts/test-deployment.js` uses the following input for the step function:

```json
{
  "id": <Programatically generated uniqueId>,
  "src": {
    "Collection": {
      "ShortName": "GEDI Cal/Val Field Data_1",
      "VersionId": "001"
    }
  },
  "query": {
    "where": {
      "project": "usa_sonoma"
    },
    "bbox": [
      -122.6,
      38.4,
      -122.5,
      38.5
    ],
    "fields": ["project", "latitude", "longitude"],
    "table":"tree"
  }
}
```

The output looks something like:

```json
[
  {
    project: 'usa_sonoma',
    latitude: 38.4673410250767,
    longitude: -122.560555589317
  },
  {
    project: 'usa_sonoma',
    latitude: 38.4643964460817,
    longitude: -122.570924053867
  },
  ...
]
```
