# description

`fix-mod-date` is a CLI tool which fixes the modification date of various file types by reading their contents. Of course it does not work with any file because the date must be saved in the file somehow.

It can happen that the modification date of a file is incorrect for various reasons, ex. if a file has been copied without preserving modification dates, such as when it is moved from one filesystem to another.

# compatibilty

Node.JS >= 10

*Note: run `export NODE_NO_WARNINGS=1` before `fix-mod-date` to avoid fs.promises API ExperimentalWarning on Node 10.x.*

# install

1. `git clone https://github.com/didrip/fix-mod-date && cd fix-mod-date`
2. `npm link`

# use

`fix-mod-date /some/file.ai /some/other/file.ai /some/directory`

## options

- `--version`: outputs version
- `t` or `--test`: test mode. date will not be modified. default = `false`.
- `v` or `--verbose`: verbose logging. default = `false`.
- `q` or `--quiet`: no output at all. default = `false`.
- `r` or `--recursive`: recursive level for processing directories. default = `1`;

# supported file types

- `ai` (Adobe Illustrator)
- `psd` (Adobe Photoshop)
- `eps` (Encapsulated Postscript)
- `aep` (Adobe After Effects project)
- `jpg/jpeg` *needs EXIF data*
- `tiff` *needs EXIF data*
- `heic` *needs EXIF data*
- `heif` *needs EXIF data*
- `webp` *needs EXIF data*
- `mp4/mpg4` (MPEG-4 Part 14)
- `m4a` (MPEG-4 Part 14 Audio)