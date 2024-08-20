; -*- mode: Lisp;-*-

(sources
  /src/master/apis/
  /src/master/programs/
  /src/master/frameworks/
  /src/master/misc/
  /src/master/resources/
  /src/master/tools/
)


(doc
  (destination general/)
  (index doc/index.md)

  (site
    (title "9551 Docs")
    (logo src/master/pack.png)
    (url https://9551.madefor.cc/docs/)
    (source-link https://github.com/9551-Dev/)

    (styles src/web/styles.css)
    ;; (scripts build/rollup/index.js)
    (head doc/head.html)
  )

  (module-kinds
    (resources Resources)
    (misc Misc)
    (frameworks Frameworks)
    (programs Programs)
    (apis APIs)
    (tools Tools)
  )

  (library-path
    /src/master/apis/
    /src/master/programs/
    /src/master/frameworks/
    /src/master/misc/
    /src/master/resources/
    /src/master/tools/
  )
)

(at /
  (linters
    -syntax:string-index
    -format:separator-space
    -format:bracket-space
  )
  (lint
    (bracket-spaces
      (call no-space)
      (function-args no-space)
      (parens no-space)
      (table space)
      (index no-space)
    )

    (globals
      :max
      _CC_DEFAULT_SETTINGS
      _CC_DISABLE_LUA51_FEATURES
      sleep
      write
      printError
      read
      rs
      colors
      colours
      commands
      disk
      fs
      gps
      help
      http
      io
      keys
      multishell
      os
      paintutils
      parallel
      peripheral
      pocket
      rednet
      redstone
      settings
      shell
      term
      textutils
      turtle
      vector
      window
      _HOST
    )
  )
)
(at
  ;; Setup override for wip/old files
  (

  )
  (
    linters -all
  )
)
