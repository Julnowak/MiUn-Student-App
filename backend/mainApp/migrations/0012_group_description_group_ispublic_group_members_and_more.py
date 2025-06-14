# Generated by Django 5.1.7 on 2025-05-13 00:29

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0011_remove_course_room_alter_group_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='description',
            field=models.TextField(blank=True, max_length=600, null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='isPublic',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='group',
            name='members',
            field=models.ManyToManyField(related_name='members', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.CharField(default='9Imp76T040MdWNdkKiqcOZF3r7jm93Xl', max_length=300),
        ),
    ]
