# Prerequisite
1. Load product data and logs *item_id,mongo_id* into csv file. See [example](xls/20170707194644.csv) csv file
2. Open [xls/makro-master.xlsm](xls/makro-master.xlsm) and goto *prod-mongo* sheet. Click menu [Data]->[From Text] and browse file from step 1.
# Load master data
Execute commands in following steps:
0. truncate all category ms db with commands in truncate.sql
1. `yarn` to install dependencies
2. `yarn load:all` to load all master data
3. After running step 1 and 2, you should get prodcat-mapping.txt, bizcat-mapping.txt and brand-mapping.txt in your logs directory.
4. Normally prodcat-errors.txt, bizcat-errors.txt and brand-errors.txt should be empty
5. Open [xls/makro-master.xlsm](xls/makro-master.xlsm). Click menu [Data]->[From Text] and import prodcat-mapping.txt, bizcat-mapping.txt and brand-mapping.txt to *product-map*, *biz-map* and *brand-map* sheet respectively
6. Export mapping between product and product category, business category and brand. Go to *prod-prodcat*, *prod-bizcat* and *prod-brand* sheet and export to [data/prod-prodcat.csv](data/prod-prodcat.csv), [data/prod-bizcat.csv](data/prod-bizcat.csv) and [data/prod-brand.csv](data/prod-brand.csv) respectively.
7. Open csv files from step 6. Remove header. Ensure that there is no blank line at the end of the file and the encoding is in utf-8
# Bind product to category
Run `yarn bindcat` to bind product to product category, business category and brand