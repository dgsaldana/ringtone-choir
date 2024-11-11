{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 5,
			"revision" : 6,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 34.0, 99.0, 527.0, 738.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "ezdac~",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 289.0, 354.0, 45.0, 45.0 ]
				}

			}
, 			{
				"box" : 				{
					"autosave" : 1,
					"id" : "obj-1",
					"inletInfo" : 					{
						"IOInfo" : [ 							{
								"type" : "event",
								"index" : 1,
								"tag" : "in1",
								"comment" : ""
							}
, 							{
								"type" : "event",
								"index" : 2,
								"tag" : "in2",
								"comment" : ""
							}
, 							{
								"type" : "event",
								"index" : 3,
								"tag" : "in3",
								"comment" : ""
							}
, 							{
								"type" : "midi",
								"index" : -1,
								"tag" : "",
								"comment" : ""
							}
 ]
					}
,
					"maxclass" : "newobj",
					"numinlets" : 4,
					"numoutlets" : 3,
					"outletInfo" : 					{
						"IOInfo" : [ 							{
								"type" : "signal",
								"index" : 1,
								"tag" : "out1",
								"comment" : ""
							}
, 							{
								"type" : "signal",
								"index" : 2,
								"tag" : "out2",
								"comment" : ""
							}
 ]
					}
,
					"outlettype" : [ "signal", "signal", "list" ],
					"patching_rect" : [ 274.0, 304.0, 88.0, 22.0 ],
					"rnboattrcache" : 					{
						"verby/jitter" : 						{
							"label" : "jitter",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"pitch_midi" : 						{
							"label" : "pitch_midi",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"verby/decay" : 						{
							"label" : "decay",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"verby/diff" : 						{
							"label" : "diff",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"verby/damp" : 						{
							"label" : "damp",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"verby/mix" : 						{
							"label" : "mix",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"verby/size" : 						{
							"label" : "size",
							"isEnum" : 0,
							"parsestring" : ""
						}
,
						"player_number" : 						{
							"label" : "player_number",
							"isEnum" : 0,
							"parsestring" : ""
						}

					}
,
					"rnboversion" : "1.2.1",
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_invisible" : 1,
							"parameter_longname" : "rnbo~",
							"parameter_shortname" : "rnbo~",
							"parameter_type" : 3
						}

					}
,
					"saved_object_attributes" : 					{
						"optimization" : "O1",
						"parameter_enable" : 1,
						"uuid" : "daf79cab-84f3-11ee-9cab-a6fc109c2d36"
					}
,
					"snapshot" : 					{
						"filetype" : "C74Snapshot",
						"version" : 2,
						"minorversion" : 0,
						"name" : "snapshotlist",
						"origin" : "rnbo~",
						"type" : "list",
						"subtype" : "Undefined",
						"embed" : 1,
						"snapshot" : 						{
							"__sps" : 							{
								"bellHarmonics[1]" : 								{

								}
,
								"bellHarmonics" : 								{

								}
,
								"verby" : 								{
									"__sps" : 									{
										"CombR~" : 										{

										}
,
										"CombL~" : 										{

										}
,
										"RoomB~" : 										{

										}
,
										"Mix~" : 										{

										}
,
										"Blur~" : 										{

										}
,
										"Shuffle~" : 										{

										}
,
										"Damp~" : 										{

										}
,
										"RoomA~" : 										{

										}

									}
,
									"diff" : 									{
										"value" : 50.0
									}
,
									"damp" : 									{
										"value" : 50.0
									}
,
									"jitter" : 									{
										"value" : 50.0
									}
,
									"mix" : 									{
										"value" : 50.0
									}
,
									"size" : 									{
										"value" : 50.0
									}
,
									"decay" : 									{
										"value" : 50.0
									}

								}
,
								"bellHarmonics[2]" : 								{

								}

							}
,
							"pitch_midi" : 							{
								"value" : 65.0
							}
,
							"player_number" : 							{
								"value" : 1.0
							}
,
							"__presetid" : "bellchoir"
						}
,
						"snapshotlist" : 						{
							"current_snapshot" : 0,
							"entries" : [ 								{
									"filetype" : "C74Snapshot",
									"version" : 2,
									"minorversion" : 0,
									"name" : "bellchoir",
									"origin" : "bellchoir",
									"type" : "rnbo",
									"subtype" : "",
									"embed" : 0,
									"snapshot" : 									{
										"__sps" : 										{
											"bellHarmonics[1]" : 											{

											}
,
											"bellHarmonics" : 											{

											}
,
											"verby" : 											{
												"__sps" : 												{
													"CombR~" : 													{

													}
,
													"CombL~" : 													{

													}
,
													"RoomB~" : 													{

													}
,
													"Mix~" : 													{

													}
,
													"Blur~" : 													{

													}
,
													"Shuffle~" : 													{

													}
,
													"Damp~" : 													{

													}
,
													"RoomA~" : 													{

													}

												}
,
												"diff" : 												{
													"value" : 50.0
												}
,
												"damp" : 												{
													"value" : 50.0
												}
,
												"jitter" : 												{
													"value" : 50.0
												}
,
												"mix" : 												{
													"value" : 50.0
												}
,
												"size" : 												{
													"value" : 50.0
												}
,
												"decay" : 												{
													"value" : 50.0
												}

											}
,
											"bellHarmonics[2]" : 											{

											}

										}
,
										"pitch_midi" : 										{
											"value" : 65.0
										}
,
										"player_number" : 										{
											"value" : 1.0
										}
,
										"__presetid" : "bellchoir"
									}
,
									"fileref" : 									{
										"name" : "bellchoir",
										"filename" : "bellchoir.maxsnap",
										"filepath" : "~/Documents/Max 8/Snapshots",
										"filepos" : -1,
										"snapshotfileid" : "7684f23a2cf4e2aadc322565ad0d1629"
									}

								}
 ]
						}

					}
,
					"text" : "rnbo~ bellchoir",
					"varname" : "rnbo~"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 1 ],
					"source" : [ "obj-1", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
 ],
		"parameters" : 		{
			"obj-1" : [ "rnbo~", "rnbo~", 0 ],
			"parameterbanks" : 			{
				"0" : 				{
					"index" : 0,
					"name" : "",
					"parameters" : [ "-", "-", "-", "-", "-", "-", "-", "-" ]
				}

			}
,
			"inherited_shortname" : 1
		}
,
		"dependency_cache" : [ 			{
				"name" : "bellchoir.maxsnap",
				"bootpath" : "~/Documents/Max 8/Snapshots",
				"patcherrelativepath" : "../Max 8/Snapshots",
				"type" : "mx@s",
				"implicit" : 1
			}
, 			{
				"name" : "bellchoir.rnbopat",
				"bootpath" : "~/Documents/Bell Choir Patch",
				"patcherrelativepath" : ".",
				"type" : "RBOP",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
