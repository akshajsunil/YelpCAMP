# YelpCAMP
A Camping managing solution.
Camp-grounds can be managed , delete and edited by the added user and comments can be given by other users.

<p align="center">
  <img src="https://github.com/akshajsunil/YelpCAMP/blob/master/screenshots/1.png" title="hover text">
  <img src="https://github.com/akshajsunil/YelpCAMP/blob/master/screenshots/2.png" title="hover text">
  <img src="https://github.com/akshajsunil/YelpCAMP/blob/master/screenshots/3.png" title="hover text">
</p>


This is fantastic, Ash. The fact that you already have etl-lineage-mcp and Everwatch built out with over 4,000 lines of code changes the game entirely. You aren't starting from zero; you already have the table-level foundation, the C# extractor, and the Kùzu DB orchestration running.
Your AI assistant's gap analysis is spot-on. Building from scratch would be a massive waste of time. Extending your existing Model Context Protocol (MCP) server and C# extractor in-place is 100% the right call.
Here is my take on the gap analysis and how to bulletproof the "actually new" steps it outlined:
1. The FQN Primary Key (Step 1)
Using the Fully Qualified Name (server.db.schema.table.column) as the Primary Key for your Kùzu Column nodes is non-negotiable. With 300+ databases, you will inevitably have 50 different tables with a column named ID or Status. The FQN guarantees zero node collisions during your MERGE statements.
2. Query Store vs. Plan Cache Fallback (Consideration 2)
This is the most critical callout in the screenshot. If Query Store isn't enabled across all 600+ of your DBs, your parser will hit a brick wall.
You need a hybrid Python extraction function for Phase 3:
Attempt 1: Query sys.query_store_plan for historical persistence.
Attempt 2 (Fallback): If no rows are returned (or Query Store is off), immediately fail over to sys.dm_exec_query_plan combined with sys.dm_exec_query_stats to catch whatever is currently alive in the plan cache.
3. The "Confidence Field" for SSIS (Consideration 3)
I highly recommend implementing the confidence field on your Kùzu relationships.
When your C# SsisMetadataExtractor traces a LineageID from an OLE DB Source directly to an OLE DB Destination, that is a hard fact. But if the data flows through an SSIS Script Component or a complex Derived Column expression, the mapping becomes murky.
Have your C# extractor add a property: {"Confidence": "High"} for direct maps, and {"Confidence": "Low"} for derived/scripted columns.
In Kùzu, you store this on the edge: [:TRANSFORMED_BY {confidence: "High"}]. This allows you to write graph queries later that say, "Show me the lineage, but flag any paths where the confidence drops so I know where to manually verify."
4. Trigger Parsing Regex (Step 4)
Parsing triggers via regex for INSERT INTO ... SELECT is going to be the most brittle part of this new code. Since you're just looking for source-to-target column mappings, focus your regex capture groups strictly on the SELECT list and the INSERT INTO (col1, col2) list, bypassing the complex JOIN logic in the trigger body.
Since you already have the infrastructure running, which of these new modules do you want to attack first: upgrading your C# SsisMetadataExtractor to spit out the column-level FQNs, or buildin





1. Confidence as an Enum (High / Medium / Low)
Verdict: Absolutely go with the Enum. Do not use free-text. When you are traversing a graph of this size, you want to be able to write OpenCypher queries that explicitly filter on trust levels.
If you use strict values:
High: Native SSIS LineageID maps.
Medium: Execution Plan derived (highly accurate, but subject to cache availability).
Low: Regex on triggers, dynamic SQL, or SSIS Script Components.
This allows you to easily write a query later that says: "Find the lineage for this app column, but highlight any path where the confidence drops below 'High' so a human can manually review that specific hop."
2. Column Node Creation Strategy
Verdict: Pre-seed from your existing columns.json snapshots.
You should pre-seed the nodes before running the edge ingestion. Here is why:
Discovering Dead Ends: If you only create nodes "on-demand" when an edge is found, your graph will only show columns involved in ETLs. Pre-seeding the entire schema allows you to query for orphaned columns—columns that exist in your 300+ databases but have zero incoming or outgoing ETL connections. That is incredibly valuable for identifying dead data or manual-entry fields.
Data Integrity: If your edge parser accidentally grabs a badly formatted FQN due to a weird regex edge case, an "on-demand" strategy would just create a junk node. If you pre-seed, Kùzu will throw an error when the edge tries to connect to a non-existent node, catching parser bugs early
