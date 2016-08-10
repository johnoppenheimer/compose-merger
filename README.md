# compose-merger

Script that merge many `docker-compose.yml` file into a big one

### How to use

`node index.js ./dockerfolder`

It assume that your `dockerfolder` contains folder with `docker-compose.yml` inside of them. It will then export the merged `docker-compose.yml` inside `./dockerfolder`

### TODO
- `-o` parameters to export the docker-compose.yml somewhere else

### LICENSE
MIT
