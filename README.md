## compose-merger

Script that merge many `docker-compose.yml` file into a big one.
Don't use `external_links:` anymore.

### How to use...

`node index.js ./dockerfolder`

It assume that your `dockerfolder` contains folder with `docker-compose.yml` inside of them.
It will then export the merged `docker-compose.yml` inside `./dockerfolder`

### ...With Docker

``` bash
$ docker pull sushifu/compose-merger:latest
$ docker run -t --rm -v /path/to/dockerfolder:/docker sushifu/compose-merger
```
Don't forget to mount your `dockerfolder` as volume `/docker`.

If you need to refresh `docker-compose.yml` often, create an alias in your shell rc:
``` bash
alias dcgen='docker run -t --rm -v /var/local/lib/docker:/docker sushifu/compose-merger'
```

### TODO
- `-o` parameters to export the docker-compose.yml somewhere else

### LICENSE
MIT
