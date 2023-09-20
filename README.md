# slove_mobile_api

## specifications and development setup

---
##### environment details

there are 5 environments you can build this project.

- local - connect with localhost database 
- development - connect with external development database
- debug- start with debug session (debugging config,bugs etc..)
- test - start test environment
- production - run this project in production 

####  local environment
> - create a file called `.env.local` in root of the project
> - copy all environment variable from `.env.example` to `.env.local`
> - fill variables with your configurations
> - run `npm run start:local` if you are using unix like os (mac,linux)
> - for Windows users run `npm run start:local-win`


####  development environment
> - update `.env.development` with your configurations
> - run `npm run start:dev` if you are using unix like os (mac,linux)
> - for Windows users run `npm run start:dev-win`

####  production environment (not tested)

there are two options for production environment
- run as a docker container `(minimal production ready dockerfile added.)`
- run as a normal node.js project
> whichever option you choose make sure to pass environment variable as parameters
```bash
# ex
docker run node-project -e NODE_ENV=production -e DATABASE_USER=pqsl ....
```

---

###  swagger documentation
- you can find swagger documentation in any environment except production.
- use `http://localhost:3000/swagger` if you are running locally or `http://project_url/swagger`

---

### postman collection 
- postman collection will be available in the folder called `postman`


### run this after starting the project and before the first request in database console

```sql

CREATE OR REPLACE FUNCTION likelihood_gen(arr1 integer[], arr2 integer[])
  RETURNS numeric
  LANGUAGE plpgsql
AS $$
DECLARE
  result_arr integer[];
  element integer;
  result_arr_length integer;
  percentage numeric;
BEGIN
  result_arr := '{}'; -- Initialize an empty array

  -- Iterate through each element of the first array
  FOREACH element IN ARRAY arr1
  LOOP
    -- Check if the element exists in the second array
    IF element = ANY(arr2) THEN
      -- Append the matching element to the result array
      result_arr := result_arr || element;
    END IF;
  END LOOP;

  -- Get the length of the result array
  result_arr_length := array_length(result_arr, 1);

  -- Calculate the percentage
  percentage := (result_arr_length * 100.0) / array_length(arr1, 1);

  -- Return the percentage
  RETURN ROUND(percentage,0);
END;
$$;


```
