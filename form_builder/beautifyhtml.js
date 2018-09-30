(function(){function style_html(html_source,options,js_beautify,css_beautify){var multi_parser,indent_size,indent_character,max_char,brace_style,unformatted;options=options||{};indent_size=options.indent_size||4;indent_character=options.indent_char||' ';brace_style=options.brace_style||'collapse';max_char=options.max_char===0?Infinity:options.max_char||250;unformatted=options.unformatted||['a','span','bdo','em','strong','dfn','code','samp','kbd','var','cite','abbr','acronym','q','sub','sup','tt','i','b','big','small','u','s','strike','font','ins','del','pre','address','dt','h1','h2','h3','h4','h5','h6'];function Parser(){this.pos=0;this.token='';this.current_mode='CONTENT';this.tags={parent:'parent1',parentcount:1,parent1:''};this.tag_type='';this.token_text=this.last_token=this.last_text=this.token_type='';this.Utils={whitespace:"\n\r\t ".split(''),single_token:'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed,?php,?,?='.split(','),extra_liners:'head,body,/html'.split(','),in_array:function(what,arr){for(var i=0;i<arr.length;i++){if(what===arr[i]){return true;}}
return false;}};this.get_content=function(){var input_char='',content=[],space=false;while(this.input.charAt(this.pos)!=='<'){if(this.pos>=this.input.length){return content.length?content.join(''):['','TK_EOF'];}
input_char=this.input.charAt(this.pos);this.pos++;this.line_char_count++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){if(content.length){space=true;}
this.line_char_count--;continue;}
else if(space){if(this.line_char_count>=this.max_char){content.push('\n');for(var i=0;i<this.indent_level;i++){content.push(this.indent_string);}
this.line_char_count=0;}
else{content.push(' ');this.line_char_count++;}
space=false;}
content.push(input_char);}
return content.length?content.join(''):'';};this.get_contents_to=function(name){if(this.pos===this.input.length){return['','TK_EOF'];}
var input_char='';var content='';var reg_match=new RegExp('</'+name+'\\s*>','igm');reg_match.lastIndex=this.pos;var reg_array=reg_match.exec(this.input);var end_script=reg_array?reg_array.index:this.input.length;if(this.pos<end_script){content=this.input.substring(this.pos,end_script);this.pos=end_script;}
return content;};this.record_tag=function(tag){if(this.tags[tag+'count']){this.tags[tag+'count']++;this.tags[tag+this.tags[tag+'count']]=this.indent_level;}
else{this.tags[tag+'count']=1;this.tags[tag+this.tags[tag+'count']]=this.indent_level;}
this.tags[tag+this.tags[tag+'count']+'parent']=this.tags.parent;this.tags.parent=tag+this.tags[tag+'count'];};this.retrieve_tag=function(tag){if(this.tags[tag+'count']){var temp_parent=this.tags.parent;while(temp_parent){if(tag+this.tags[tag+'count']===temp_parent){break;}
temp_parent=this.tags[temp_parent+'parent'];}
if(temp_parent){this.indent_level=this.tags[tag+this.tags[tag+'count']];this.tags.parent=this.tags[temp_parent+'parent'];}
delete this.tags[tag+this.tags[tag+'count']+'parent'];delete this.tags[tag+this.tags[tag+'count']];if(this.tags[tag+'count']===1){delete this.tags[tag+'count'];}
else{this.tags[tag+'count']--;}}};this.get_tag=function(peek){var input_char='',content=[],comment='',space=false,tag_start,tag_end,orig_pos=this.pos,orig_line_char_count=this.line_char_count;peek=peek!==undefined?peek:false;do{if(this.pos>=this.input.length){if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count;}
return content.length?content.join(''):['','TK_EOF'];}
input_char=this.input.charAt(this.pos);this.pos++;this.line_char_count++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){space=true;this.line_char_count--;continue;}
if(input_char==="'"||input_char==='"'){if(!content[1]||content[1]!=='!'){input_char+=this.get_unformatted(input_char);space=true;}}
if(input_char==='='){space=false;}
if(content.length&&content[content.length-1]!=='='&&input_char!=='>'&&space){if(this.line_char_count>=this.max_char){this.print_newline(false,content);this.line_char_count=0;}
else{content.push(' ');this.line_char_count++;}
space=false;}
if(input_char==='<'){tag_start=this.pos-1;}
content.push(input_char);}while(input_char!=='>');var tag_complete=content.join('');var tag_index;if(tag_complete.indexOf(' ')!==-1){tag_index=tag_complete.indexOf(' ');}
else{tag_index=tag_complete.indexOf('>');}
var tag_check=tag_complete.substring(1,tag_index).toLowerCase();if(tag_complete.charAt(tag_complete.length-2)==='/'||this.Utils.in_array(tag_check,this.Utils.single_token)){if(!peek){this.tag_type='SINGLE';}}
else if(tag_check==='script'){if(!peek){this.record_tag(tag_check);this.tag_type='SCRIPT';}}
else if(tag_check==='style'){if(!peek){this.record_tag(tag_check);this.tag_type='STYLE';}}
else if(this.is_unformatted(tag_check,unformatted)){comment=this.get_unformatted('</'+tag_check+'>',tag_complete);content.push(comment);if(tag_start>0&&this.Utils.in_array(this.input.charAt(tag_start-1),this.Utils.whitespace)){content.splice(0,0,this.input.charAt(tag_start-1));}
tag_end=this.pos-1;if(this.Utils.in_array(this.input.charAt(tag_end+1),this.Utils.whitespace)){content.push(this.input.charAt(tag_end+1));}
this.tag_type='SINGLE';}
else if(tag_check.charAt(0)==='!'){if(tag_check.indexOf('[if')!==-1){if(tag_complete.indexOf('!IE')!==-1){comment=this.get_unformatted('-->',tag_complete);content.push(comment);}
if(!peek){this.tag_type='START';}}
else if(tag_check.indexOf('[endif')!==-1){this.tag_type='END';this.unindent();}
else if(tag_check.indexOf('[cdata[')!==-1){comment=this.get_unformatted(']]>',tag_complete);content.push(comment);if(!peek){this.tag_type='SINGLE';}}
else{comment=this.get_unformatted('-->',tag_complete);content.push(comment);this.tag_type='SINGLE';}}
else if(!peek){if(tag_check.charAt(0)==='/'){this.retrieve_tag(tag_check.substring(1));this.tag_type='END';}
else{this.record_tag(tag_check);this.tag_type='START';}
if(this.Utils.in_array(tag_check,this.Utils.extra_liners)){this.print_newline(true,this.output);}}
if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count;}
return content.join('');};this.get_unformatted=function(delimiter,orig_tag){if(orig_tag&&orig_tag.toLowerCase().indexOf(delimiter)!==-1){return '';}
var input_char='';var content='';var space=true;do{if(this.pos>=this.input.length){return content;}
input_char=this.input.charAt(this.pos);this.pos++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){if(!space){this.line_char_count--;continue;}
if(input_char==='\n'||input_char==='\r'){content+='\n';this.line_char_count=0;continue;}}
content+=input_char;this.line_char_count++;space=true;}while(content.toLowerCase().indexOf(delimiter)===-1);return content;};this.get_token=function(){var token;if(this.last_token==='TK_TAG_SCRIPT'||this.last_token==='TK_TAG_STYLE'){var type=this.last_token.substr(7);token=this.get_contents_to(type);if(typeof token!=='string'){return token;}
return[token,'TK_'+type];}
if(this.current_mode==='CONTENT'){token=this.get_content();if(typeof token!=='string'){return token;}
else{return[token,'TK_CONTENT'];}}
if(this.current_mode==='TAG'){token=this.get_tag();if(typeof token!=='string'){return token;}
else{var tag_name_type='TK_TAG_'+this.tag_type;return[token,tag_name_type];}}};this.get_full_indent=function(level){level=this.indent_level+level||0;if(level<1){return '';}
return Array(level+1).join(this.indent_string);};this.is_unformatted=function(tag_check,unformatted){if(!this.Utils.in_array(tag_check,unformatted)){return false;}
if(tag_check.toLowerCase()!=='a'||!this.Utils.in_array('a',unformatted)){return true;}
var next_tag=this.get_tag(true);var tag=(next_tag||"").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);if(!tag||this.Utils.in_array(tag,unformatted)){return true;}else{return false;}};this.printer=function(js_source,indent_character,indent_size,max_char,brace_style){this.input=js_source||'';this.output=[];this.indent_character=indent_character;this.indent_string='';this.indent_size=indent_size;this.brace_style=brace_style;this.indent_level=0;this.max_char=max_char;this.line_char_count=0;for(var i=0;i<this.indent_size;i++){this.indent_string+=this.indent_character;}
this.print_newline=function(ignore,arr){this.line_char_count=0;if(!arr||!arr.length){return;}
if(!ignore){while(this.Utils.in_array(arr[arr.length-1],this.Utils.whitespace)){arr.pop();}}
arr.push('\n');for(var i=0;i<this.indent_level;i++){arr.push(this.indent_string);}};this.print_token=function(text){this.output.push(text);};this.indent=function(){this.indent_level++;};this.unindent=function(){if(this.indent_level>0){this.indent_level--;}};};return this;}
multi_parser=new Parser();multi_parser.printer(html_source,indent_character,indent_size,max_char,brace_style);while(true){var t=multi_parser.get_token();multi_parser.token_text=t[0];multi_parser.token_type=t[1];if(multi_parser.token_type==='TK_EOF'){break;}
switch(multi_parser.token_type){case 'TK_TAG_START':multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);multi_parser.indent();multi_parser.current_mode='CONTENT';break;case 'TK_TAG_STYLE':case 'TK_TAG_SCRIPT':multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_TAG_END':if(multi_parser.last_token==='TK_CONTENT'&&multi_parser.last_text===''){var tag_name=multi_parser.token_text.match(/\w+/)[0];var tag_extracted_from_last_output=multi_parser.output[multi_parser.output.length-1].match(/<\s*(\w+)/);if(tag_extracted_from_last_output===null||tag_extracted_from_last_output[1]!==tag_name){multi_parser.print_newline(true,multi_parser.output);}}
multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_TAG_SINGLE':var tag_check=multi_parser.token_text.match(/^\s*<([a-z]+)/i);if(!tag_check||!multi_parser.Utils.in_array(tag_check[1],unformatted)){multi_parser.print_newline(false,multi_parser.output);}
multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode='CONTENT';break;case 'TK_CONTENT':if(multi_parser.token_text!==''){multi_parser.print_token(multi_parser.token_text);}
multi_parser.current_mode='TAG';break;case 'TK_STYLE':case 'TK_SCRIPT':if(multi_parser.token_text!==''){multi_parser.output.push('\n');var text=multi_parser.token_text,_beautifier,script_indent_level=1;if(multi_parser.token_type==='TK_SCRIPT'){_beautifier=typeof js_beautify==='function'&&js_beautify;}else if(multi_parser.token_type==='TK_STYLE'){_beautifier=typeof css_beautify==='function'&&css_beautify;}
if(options.indent_scripts==="keep"){script_indent_level=0;}else if(options.indent_scripts==="separate"){script_indent_level=-multi_parser.indent_level;}
var indentation=multi_parser.get_full_indent(script_indent_level);if(_beautifier){text=_beautifier(text.replace(/^\s*/,indentation),options);}else{var white=text.match(/^\s*/)[0];var _level=white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length-1;var reindent=multi_parser.get_full_indent(script_indent_level-_level);text=text.replace(/^\s*/,indentation).replace(/\r\n|\r|\n/g,'\n'+reindent).replace(/\s*$/,'');}
if(text){multi_parser.print_token(text);multi_parser.print_newline(true,multi_parser.output);}}
multi_parser.current_mode='TAG';break;}
multi_parser.last_token=multi_parser.token_type;multi_parser.last_text=multi_parser.token_text;}
return multi_parser.output.join('');}
window.html_beautify=function(html_source,options){return style_html(html_source,options,window.js_beautify,window.css_beautify);};}());