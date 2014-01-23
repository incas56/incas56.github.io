---
published: true
layout: post
---

h2. {{ page.title }}

p(publish_date). 23 jan 2014

When working with data you must:

*Figure out what you want to do.

*Precisely describe what you want in the form of a computer program.

*Execute the code.

The dplyr package makes each of these steps as fast and easy as possible by:

-Elucidating the most common data manipulation operations, so that        your options are helpfully constrained when thinking about how to tackle a problem.

-Providing simple functions that correspond to the most common data manipulation verbs, so that you can easily translate your thoughts into code.

-Using efficient data storage backends, so that you spend as little time waiting for the computer as possible.

The goal of this document is to introduce you to the basic tools that dplyr provides, and show how you to apply them to data frames. Other vignettes provide more details on specific topics:

-databases: as well as in memory data frames, dplyr also connects to databases. It allows you to work with remote, out-of-memory data, using exactly the same tools, because dplyr will translate your R code into the appropriate SQL.

-benchmark-baseball: see how dplyr compares to other tools for data manipulation on a realistic use case.

-window-functions: a window function is a variation on an aggregation function, where an aggregate functions n inputs to produce 1 output, a window function uses n inputs to produce n outputs.

### Basic verbs

dplyr can work with data frames as is, but if you're dealing with large data, it's worthwhile to convert them to a **_tbl_df_**: this is a wrapper around a data frame that won't accidentally print a lot of data to the screen.

<pre class="terminal">library(hflights)
dim(hflights)
hflights_df <- tbl_df(hflights)
hflights_df
</pre>

>dplyr provides five basic data manipulation verbs that work on a single table: filter(), arrange(), select(), mutate() and summarise(). If you've used plyr before, many of these will be familar.

####Filter rows with filter()

filter() allows you to select a subset of the rows of a data frame. The first argument is the name of the data frame, and the second and subsequent are filtering expressions evaluated in the context of that data frame:

For example, we can select all flights on January 1st with:

```terminal
filter(hflights_df, Month == 1, DayofMonth == 1)
```
This is equivalent to the more verbose:

```terminal
hflights[hflights$Month == 1 & hflights$DayofMonth == 1, ]
```

filter() works similarly to subset() except that you can give it any number of filtering conditions which are joined together with. You can use other boolean operators explicitly:

```terminal
filter(hflights_df, Month == 1 | Month == 2)
```

####Arrange rows with arrange()

arrange() works similarly to filter() except that instead of filtering or selecting rows, it reorders them. It takes a data frame, and a set of column names (or more complicated expressions) to order by. If you provide more than one column name, each additional column will be used to break ties in the valeus of preceeding columns:

```terminal
arrange(hflights_df, DayofMonth, Month, Year)
```

Use desc() to order a order in descending order:

```terminal
arrange(hflights_df, desc(ArrDelay))
```

dplyr::arrange() works the same way as plyr::arrange(). It's a straighforward wrapper around order() that requires less typing. The previous code is equivalent to:

```terminal
hflights[order(hflights$DayofMonth, hflights$Month, hflights$Year), ]
hflights[order(desc(hflights$ArrDelay)), ]
```

####Select columns with select()

Often you work with large datasets with many columns where only a few are actually of interest to you. select() allows you to rapidly zoom in on a useful subset using operations that usually only work on numeric variable positions:

```terminal
# Select columns by name
select(hflights_df, Year, Month, DayOfWeek)
```

```terminal
# Select all columns between Year and DayOfWeek (inclusive)
select(hflights_df, Year:DayOfWeek)
```

```terminal
# Select all columns except Year and DayOfWeek
select(hflights_df, -(Year:DayOfWeek))
```

This function works similarly to the select argument to the base::subset(). It's its own function in dplyr, because the dplyr philosophy is to have small functions that each do one thing well.

####Add new columns with mutate()

As well as selecting from the set of existing columns, it's often useful to add new columns that are functions of existing columns. This is the job of mutate():

```terminal
mutate(hflights_df, gain = ArrDelay - DepDelay, speed = Distance /AirTime * 60)
```

dplyr::mutate() works the same way as plyr::mutate() and similarly to base::transform(). The key difference between mutate() and transform() is that mutate allows you to refer to columns that you just created:

```terminal
mutate(hflights_df, gain = ArrDelay - DepDelay, gain_per_hour = gain / (AirTime / 60))
```

```terminal
transform(hflights, gain = ArrDelay - DepDelay, gain_per_hour = gain / (AirTime / 60))
#> Error: object 'gain' not found
```

####Summarise values with summarise()

The last verb is summarise(), which collapses a data frame to a single row. It's not very useful yet:

```terminal
summarise(hflights_df, delay = mean(DepDelay, na.rm = TRUE))
```

This is exactly equivalent to plyr::summarise().


###Commonalities

You may have noticed that all these functions are very similar:

*The first argument is a data frame.

*The subsequent arguments describe what to do with it, and you can refer to columns in the data frame directly without using $.

*The result is a new data frame

Together these properties make it easy to chain together multiple simple steps to achieve a complex result.

These five functions provide the basis of a language of data manipulation. At the most basic level, you can only alter a tidy data frame in five useful ways: you can reorder the rows (arrange()), pick observations and variables of interest (filter() and select()), add new variables that are functions of existing variables (mutate()) or collapse many values to a summary (summarise()). The remainder of the language comes from applying the five functions to different types of data, like to grouped data, as described next.

###Grouped operations
These verbs are useful, but they become really powerful when you combine them with the idea of "group_by", repeating the operation individually on groups of observations within the tbl. In dplyr, you use the group_by() function to describe how to break a dataset down into groups of rows. You can then use the resulting object in the exactly the same functions as above; they'll automatically work “by group” when the input is a grouped tbl.

Of the five verbs, arrange() and select() are unaffected by grouping. Group-wise mutate() and arrange() are most useful in conjunction with window functions, and are described in detail in the corresponding vignette(). summarise() is easy to understand and very useful, and is described in more detail below.

In the following example, we split the complete dataset into individual planes and then summarise each plane by counting the number of flights (count = n()) and computing the average distance (dist = mean(Distance, na.rm = TRUE)) and delay (delay = mean(ArrDelay, na.rm = TRUE)). We then use ggplot2 to display the output.
