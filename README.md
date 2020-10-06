# description

`fix-mod-date` is a CLI tool which fixes the modification date of various file types by reading their contents. Of course it does not work with any file because the date must be saved in the file somehow.

It can happen that the modification date of a file is incorrect for various reasons, ex. if a file has been copied without preserving modification dates, such as when it is moved from one filesystem to another.

# install

`npm link`

# use

`fix-mod-date /some/file.ai`

# supported file types

- `ai` (Adobe Illustrator)
- `xml` (XML files) => WIP