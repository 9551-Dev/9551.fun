--- The Main module 
-- @module GuiH.API

local GuiH = {}

--- Make a new Gui object with the given terminal/window
--- and optionaly event offset
-- @tparam table terminal term/window object
-- @tparam[opt] number event_offset_x sets the horizontal offset of all events
-- @tparam[opt] number event_offset_y sets the vertical offset of all events
-- @treturn table GuiH.MAIN_UI
-- @usage
-- local GuiH = require("GuiH")
-- local gui = GuiH.new(term.current())
-- print(gui)
function GuiH.new(terminal,event_offset_x,event_offset_y)
end


--- Alias for GuiH.new
-- @see GuiH.new
function GuiH.create_gui()
end

--- Used for loading basic textures
--- similiar to the nimg format
-- @tparam {string/table} path Path to the texture or the texture data in a table
-- @treturn table GuiH.texture
-- @usage
-- local GuiH = require("GuiH")
-- local texture = GuiH.load_texture({})
-- print(texture)

function GuiH.load_texture(path)
end

--- Processes an event into a more usable format
-- @param event all of the events results unpacked
-- @treturn table GuiH.event
function GuiH.convert_event(event)
end

--- All of the additional GuiH apis loaded
-- @see module_index
GuiH.apis = {}

return GuiH