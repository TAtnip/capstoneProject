# Generated by Django 5.1.1 on 2024-09-25 02:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_rename_musclegroups_exercise_muscle_groups"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="session",
            name="name",
        ),
        migrations.AlterField(
            model_name="session",
            name="notes",
            field=models.TextField(blank=True, null=True),
        ),
    ]
